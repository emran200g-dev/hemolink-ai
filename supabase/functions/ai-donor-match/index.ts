import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let bloodGroup: string;
  let city: string;
  let country: string;
  let urgency: string;
  let donors: unknown[];
  let mode: string;

  try {
    const body = await req.json();
    bloodGroup = body.bloodGroup || "O+";
    city = body.city || "";
    country = body.country || "";
    urgency = body.urgency || "HIGH";
    donors = body.donors || [];
    mode = body.mode || "search"; // "search" | "eligibility" | "notification"
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let prompt = "";
  if (mode === "eligibility") {
    const { age, weight, lastDonated } = donors[0] as Record<string, unknown>;
    prompt = `You are a blood donation eligibility AI for HemoLink. Evaluate if this person is eligible to donate blood:
- Age: ${age} years
- Weight: ${weight} kg
- Last donated: ${lastDonated || "Never"}

Respond in JSON format: { "eligible": true/false, "reason": "brief reason", "nextEligibleDate": "date or null", "recommendation": "short advice" }
Only return valid JSON, no markdown.`;
  } else if (mode === "notification") {
    const donor = donors[0] as Record<string, unknown>;
    prompt = `You are HemoLink AI coordinator. Write a compelling, urgent but respectful blood donation request message to send to donor ${donor.name} (Blood group: ${donor.bloodGroup}).

Context:
- Patient needs ${bloodGroup} blood
- Hospital: ${city}, ${country}
- Urgency: ${urgency}

Write a concise in-app notification message (max 3 sentences) that explains the urgency, thanks the donor, and includes the call to action. Be warm and human.`;
  } else {
    const donorList = donors.slice(0, 5).map((d: unknown) => {
      const donor = d as Record<string, unknown>;
      return `- ${donor.name} (${donor.bloodGroup}, ${donor.distance}km away, ${donor.available ? "Available" : "Unavailable"}, ${donor.donations} donations)`;
    }).join("\n");

    prompt = `You are HemoLink AI, an intelligent blood donor matching system. Analyze these nearby blood donors for a ${bloodGroup} blood request in ${city}, ${country} (Urgency: ${urgency}):

${donorList}

Provide a brief AI analysis (2-3 sentences) explaining:
1. Which donor is the best match and why
2. The overall availability situation
3. A recommendation for the requester

Keep it concise, professional, and life-saving focused.`;
  }

  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  const upstream = await fetch(
    "https://app-c9nw4nvprjep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ contents }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: `AI error: ${upstream.status}` }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Accumulate full response for non-streaming JSON responses
  if (mode === "eligibility") {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) fullText += text;
          } catch { /* skip */ }
        }
      }
    }

    return new Response(JSON.stringify({ result: fullText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Stream through for chat/search
  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
});
