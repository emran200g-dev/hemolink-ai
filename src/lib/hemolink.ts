import { supabase } from '@/db/supabase';
import type { Donor } from '@/types/types';

/** Parse SSE stream and accumulate full text */
export async function streamToText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) full += text;
        } catch { /* skip */ }
      }
    }
  }
  return full;
}

/** Call LLM chat edge function with SSE streaming */
export async function callLLMStream(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  onChunk: (text: string) => void,
  systemPrompt?: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('llm-chat', {
    body: { contents, systemPrompt },
  });

  if (error) {
    const msg = await error?.context?.text?.() ?? error.message;
    throw new Error(msg);
  }

  if (data instanceof ReadableStream) {
    const reader = data.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) onChunk(text);
          } catch { /* skip */ }
        }
      }
    }
  }
}

/** Haversine distance in km */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/** Generate mock donors for hackathon demo */
export function generateMockDonors(bloodGroup: string, city: string, country: string): Donor[] {
  const names = [
    'Omar Hassan', 'Priya Sharma', 'Carlos Mendoza', 'Fatima Al-Zahra', 'Yuki Tanaka',
    'Amara Diallo', 'David Okafor', 'Sara Ahmed', 'Liam Chen', 'Aisha Kamel',
    'Mina Girgis', 'Sofia Patel', 'Ahmed Nasser', 'Maria Santos', 'James Osei',
  ];
  const phones = [
    '+20 100 123 4567', '+91 98765 43210', '+52 55 1234 5678', '+966 50 123 4567',
    '+81 90 1234 5678', '+234 801 234 5678', '+254 700 123456', '+92 300 1234567',
    '+86 138 0013 8000', '+20 100 987 6543', '+20 100 555 1234', '+44 7700 900123',
    '+971 50 123 4567', '+55 11 91234-5678', '+233 24 123 4567',
  ];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return names.slice(0, 8).map((name, i) => ({
    id: `mock-${i}`,
    name,
    age: 20 + Math.floor(Math.random() * 20),
    weight: 55 + Math.floor(Math.random() * 30),
    blood_group: i % 3 === 0 ? bloodGroup : bloodGroups[(i + 2) % 8],
    city,
    country,
    phone: phones[i] || '+1 555 000 0000',
    whatsapp: i % 2 === 0 ? phones[i] : undefined,
    available: Math.random() > 0.3,
    last_donated: i % 4 === 0 ? undefined : new Date(Date.now() - (30 + i * 15) * 86400000).toISOString().split('T')[0],
    donations_count: Math.floor(Math.random() * 40) + 1,
    lat: 0,
    lng: 0,
    distance: +(Math.random() * 9 + 0.5).toFixed(1),
    matchScore: Math.floor(Math.random() * 25) + 72,
    created_at: new Date().toISOString(),
  }));
}

/** Badge config */
export const BADGES = [
  { name: 'First Drop', desc: 'First donation', earned: true, icon: '🩸', color: '#c0152a', threshold: 1 },
  { name: 'Life Saver', desc: '5 donations', earned: true, icon: '❤️', color: '#e85d75', threshold: 5 },
  { name: 'Silver Hero', desc: '10+ donations', earned: true, icon: '🥈', color: '#94a3b8', threshold: 10 },
  { name: 'Gold Lifesaver', desc: '25+ donations', earned: false, icon: '🥇', color: '#f59e0b', threshold: 25, progress: 48 },
  { name: 'Platinum Guardian', desc: '40+ donations', earned: false, icon: '💎', color: '#6366f1', threshold: 40, progress: 30 },
  { name: 'AI Pioneer', desc: 'Used HemoLink AI', earned: true, icon: '🤖', color: '#2d6a8f', threshold: 0 },
  { name: 'Emergency Responder', desc: 'Responded within 1 hour', earned: true, icon: '⚡', color: '#f97316', threshold: 0 },
  { name: 'Global Donor', desc: 'Donated in 2+ countries', earned: false, icon: '🌍', color: '#2a9d8f', threshold: 0, progress: 50 },
];
