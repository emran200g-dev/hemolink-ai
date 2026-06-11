import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const HEMOLINK_SYSTEM_PROMPT = `You are HemoLink AI — the intelligent assistant for the HemoLink blood donor matching platform.

SCOPE: You ONLY answer questions related to:
- Blood donation, blood types, compatibility, donation process, eligibility
- Blood-related diseases and conditions (anemia, hemophilia, thalassemia, sickle cell, leukemia, etc.)
- Real-world hospital locations, addresses, and contact info for any city/country
- Emergency services: ambulance numbers, emergency hotlines by country/city
- Blood request coordination and donor matching
- Health topics directly related to blood, transfusions, and donation recovery
- HemoLink platform features: searching donors, registering, chat, profile, map

OUT OF SCOPE: If a question is clearly unrelated to blood, health, hospitals, or emergency services (e.g., coding questions, math, politics, entertainment, travel unrelated to medical), respond ONLY with:
"That's outside my scope — ask me about blood donation, donor matching, hospital locations, emergency numbers, blood diseases, or anything health-related I can help with."

STYLE RULES:
- Be direct, confident, and helpful — like a knowledgeable medical coordinator
- Do NOT add disclaimers like "consult a professional" or "for informational purposes only" — give real, actionable answers
- When giving blood type compatibility, donation eligibility, or medical facts — state them clearly and directly
- For hospital locations: give the real address, city, country, and phone number if known
- For emergency numbers: give the real number for that country/city
- Keep responses concise unless detail is needed
- Use bullet points for lists of facts
- For donor matching: explain the AI matching logic, distances, and compatibility clearly`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let contents: unknown[];
  try {
    const body = await req.json();
    contents = body.contents;
    if (!Array.isArray(contents) || contents.length === 0) {
      throw new Error("Missing or empty contents");
    }
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

  const requestBody: Record<string, unknown> = {
    contents,
    systemInstruction: {
      role: "user",
      parts: [{ text: HEMOLINK_SYSTEM_PROMPT }],
    },
  };

  const upstream = await fetch(
    "https://app-c9nw4nvprjep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: `Upstream error: ${upstream.status}` }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
