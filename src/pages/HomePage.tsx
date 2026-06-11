import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, Zap, MapPin, Shield, Award, ArrowRight, Activity,
  Users, Heart, Clock, CheckCircle, TrendingUp, ChevronRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STATS = [
  { label: 'Registered Donors', value: '142,891', icon: Users, color: '#c0152a' },
  { label: 'Lives Saved', value: '28,340', icon: Heart, color: '#e85d75' },
  { label: 'Countries', value: '24', icon: MapPin, color: '#2d6a8f' },
  { label: 'Avg. Match Time', value: '4.2 min', icon: Clock, color: '#2a9d8f' },
];

const TOP_DONORS = [
  { rank: 1, name: 'Omar Hassan', country: 'Egypt', bloodGroup: 'O+', donations: 47, badge: 'Platinum Guardian', avatar: 'OH' },
  { rank: 2, name: 'Priya Sharma', country: 'India', bloodGroup: 'B+', donations: 41, badge: 'Gold Lifesaver', avatar: 'PS' },
  { rank: 3, name: 'Carlos Mendoza', country: 'Mexico', bloodGroup: 'A+', donations: 38, badge: 'Gold Lifesaver', avatar: 'CM' },
  { rank: 4, name: 'Fatima Al-Zahra', country: 'Saudi Arabia', bloodGroup: 'AB+', donations: 35, badge: 'Silver Hero', avatar: 'FA' },
  { rank: 5, name: 'Yuki Tanaka', country: 'Japan', bloodGroup: 'O-', donations: 31, badge: 'Silver Hero', avatar: 'YT' },
];

const MONTHLY_DATA = [
  { month: 'Jan', donations: 2840 }, { month: 'Feb', donations: 3120 },
  { month: 'Mar', donations: 2950 }, { month: 'Apr', donations: 3800 },
  { month: 'May', donations: 4200 }, { month: 'Jun', donations: 3950 },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register as Donor', desc: 'Sign up with your blood group, location, and contact details. AI verifies and activates your profile instantly.', icon: Users },
  { step: '02', title: 'AI Matches in Seconds', desc: 'Our neural engine analyzes patient needs — blood type, urgency, surgery date — and geo-matches nearest available donors.', icon: Zap },
  { step: '03', title: 'Instant Notification', desc: 'Donor receives an AI-generated in-app message with patient details, hospital location, and surgery time window.', icon: Activity },
  { step: '04', title: 'Donate & Earn Honor', desc: 'After donation, AI confirms via hospital, awards badges, and lists donor on the global honor leaderboard.', icon: Award },
];

const BLOOD_COMPAT = [
  { group: 'O-', canDonateTo: ['O-','O+','A-','A+','B-','B+','AB-','AB+'], canReceiveFrom: ['O-'] },
  { group: 'O+', canDonateTo: ['O+','A+','B+','AB+'], canReceiveFrom: ['O-','O+'] },
  { group: 'A-', canDonateTo: ['A-','A+','AB-','AB+'], canReceiveFrom: ['O-','A-'] },
  { group: 'A+', canDonateTo: ['A+','AB+'], canReceiveFrom: ['O-','O+','A-','A+'] },
  { group: 'B-', canDonateTo: ['B-','B+','AB-','AB+'], canReceiveFrom: ['O-','B-'] },
  { group: 'B+', canDonateTo: ['B+','AB+'], canReceiveFrom: ['O-','O+','B-','B+'] },
  { group: 'AB-', canDonateTo: ['AB-','AB+'], canReceiveFrom: ['O-','A-','B-','AB-'] },
  { group: 'AB+', canDonateTo: ['AB+'], canReceiveFrom: ['O-','O+','A-','A+','B-','B+','AB-','AB+'] },
];

const RECENT_REQUESTS = [
  { hospital: 'Al-Ahly Hospital', city: 'Cairo, Egypt', group: 'O+', urgency: 'CRITICAL', time: '5 min ago', matched: true },
  { hospital: 'Apollo Hospital', city: 'Mumbai, India', group: 'B-', urgency: 'HIGH', time: '12 min ago', matched: true },
  { hospital: "St. Mary's Medical", city: 'London, UK', group: 'AB+', urgency: 'MODERATE', time: '34 min ago', matched: false },
  { hospital: 'Kenyatta National', city: 'Nairobi, Kenya', group: 'A+', urgency: 'HIGH', time: '1h ago', matched: true },
  { hospital: 'Aga Khan Hospital', city: 'Karachi, Pakistan', group: 'O-', urgency: 'CRITICAL', time: '2h ago', matched: true },
];

const badgeColors: Record<string, string> = {
  'Platinum Guardian': '#6366f1',
  'Gold Lifesaver': '#f59e0b',
  'Silver Hero': '#94a3b8',
};

const urgencyStyle = (u: string) => {
  if (u === 'CRITICAL') return { bg: '#c0152a', text: '#fff' };
  if (u === 'HIGH') return { bg: '#f97316', text: '#fff' };
  return { bg: '#2d6a8f', text: '#fff' };
};

export default function HomePage() {
  const [aiTyping, setAiTyping] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const fullText = 'Scanning 142,891 registered donors across 24 countries... Geo-matching nearest compatible donors... AI neural match score computed. 3 donors found within 4.2km.';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) { setAiTyping(fullText.slice(0, i)); i++; }
      else clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const selectedCompat = BLOOD_COMPAT.find(b => b.group === selectedGroup);

  return (
    <div className="font-sans">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#0d0a0b', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Red accent blob */}
        <div className="absolute pointer-events-none" style={{ top: '10%', right: '5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(192,21,42,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-24 w-full">
          <div className="max-w-2xl">
            {/* AI badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6" style={{ borderColor: 'rgba(192,21,42,0.4)', background: 'rgba(192,21,42,0.1)' }}>
              <Zap size={14} style={{ color: '#ff3b30' }} />
              <span className="font-mono-dm text-xs" style={{ color: '#ff3b30' }}>AI-POWERED MATCHING ENGINE</span>
            </div>

            <h1 className="font-barlow font-bold leading-none mb-4 text-balance" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff' }}>
              SAVE LIVES WITH{' '}
              <span className="gradient-text">AI-POWERED</span>
              {' '}BLOOD MATCHING
            </h1>

            <p className="text-lg mb-8 leading-relaxed text-pretty" style={{ color: 'rgba(255,255,255,0.65)' }}>
              HemoLink connects emergency patients with registered blood donors in seconds. Our AI scans thousands of donors, geo-matches the nearest compatible match, and sends instant notifications — all in under 5 minutes.
            </p>

            {/* AI terminal */}
            <div className="rounded-lg border p-4 mb-8 font-mono-dm text-sm" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(192,21,42,0.3)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs" style={{ color: '#ff3b30' }}>HEMOLINK AI — LIVE SCAN</span>
              </div>
              <span style={{ color: '#4ade80' }}>{aiTyping}</span>
              <span className="cursor-blink" style={{ color: '#4ade80' }}>▋</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/donor?tab=register" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold transition-all hover:opacity-90" style={{ background: '#c0152a', color: '#fff' }}>
                <Droplets size={18} fill="#fff" />
                Become a Donor
              </Link>
              <Link to="/donor" className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold border transition-all hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                Request Blood
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────── */}
      <section className="py-12 border-b" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--border))' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <div>
                  <div className="font-barlow text-2xl font-bold" style={{ color }}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-mono-dm mb-3">
              <Zap size={12} /> AI WORKFLOW
            </div>
            <h2 className="font-barlow text-3xl md:text-4xl font-bold text-balance">HOW HEMOLINK AI WORKS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative p-6 rounded-xl border bg-card h-full flex flex-col" style={{ borderColor: 'hsl(var(--border))' }}>
                <div className="font-barlow text-5xl font-bold mb-3" style={{ color: 'hsl(var(--primary) / 0.15)' }}>{step}</div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                  <Icon size={20} style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h3 className="font-semibold text-base mb-2 text-balance">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 text-pretty">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOOD COMPAT + RECENT REQUESTS ─────────── */}
      <section className="py-16" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Blood Compatibility */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} style={{ color: 'hsl(var(--primary))' }} />
                <h2 className="font-barlow text-2xl font-bold">BLOOD COMPATIBILITY CHART</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Click a blood group to see donation compatibility.</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {BLOOD_COMPAT.map(({ group }) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className="py-2 rounded-lg text-sm font-semibold border transition-all"
                    style={selectedGroup === group
                      ? { background: '#c0152a', color: '#fff', borderColor: '#c0152a' }
                      : { background: '#f7f4f2', color: '#0d0a0b', borderColor: 'hsl(var(--border))' }}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {selectedCompat && (
                <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'hsl(var(--border))' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-white font-barlow text-xl font-bold">{selectedGroup}</div>
                    <div>
                      <div className="font-semibold">Blood Group {selectedGroup}</div>
                      <div className="text-sm text-muted-foreground font-mono-dm">AI Compatibility Analysis</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono-dm mb-2">CAN DONATE TO ({selectedCompat.canDonateTo.length} groups)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCompat.canDonateTo.map(g => (
                        <span key={g} className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#4ade8020', color: '#16a34a' }}>{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono-dm mb-2">CAN RECEIVE FROM ({selectedCompat.canReceiveFrom.length} groups)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCompat.canReceiveFrom.map(g => (
                        <span key={g} className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#c0152a18', color: '#c0152a' }}>{g}</span>
                      ))}
                    </div>
                  </div>
                  {selectedGroup === 'O-' && <div className="text-xs font-mono-dm px-2 py-1 rounded" style={{ background: '#c0152a10', color: '#c0152a' }}>⚡ Universal Donor — Can donate to ALL blood groups</div>}
                  {selectedGroup === 'AB+' && <div className="text-xs font-mono-dm px-2 py-1 rounded" style={{ background: '#2d6a8f10', color: '#2d6a8f' }}>⚡ Universal Recipient — Can receive from ALL blood groups</div>}
                </div>
              )}
            </div>

            {/* Recent Requests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity size={18} style={{ color: 'hsl(var(--primary))' }} />
                  <h2 className="font-barlow text-2xl font-bold">LIVE BLOOD REQUESTS</h2>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(192,21,42,0.1)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono-dm text-primary">LIVE</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5">AI-processed blood requests from hospitals worldwide.</p>
              <div className="space-y-3">
                {RECENT_REQUESTS.map((r, i) => {
                  const us = urgencyStyle(r.urgency);
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card transition-all hover:border-primary/30" style={{ borderColor: 'hsl(var(--border))' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-barlow font-bold text-sm" style={{ background: '#c0152a18', color: '#c0152a' }}>{r.group}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="font-medium text-sm truncate">{r.hospital}</div>
                          <span className="px-1.5 py-0.5 rounded text-xs font-mono-dm shrink-0" style={{ background: us.bg, color: us.text }}>{r.urgency}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {r.city}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono-dm text-xs text-muted-foreground">{r.time}</span>
                          {r.matched
                            ? <span className="flex items-center gap-1 text-xs" style={{ color: '#16a34a' }}><CheckCircle size={12} />Matched</span>
                            : <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} />Searching...</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MONTHLY CHART + LEADERBOARD ────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Monthly Donations Chart */}
            <div className="rounded-xl border bg-card p-6 h-full flex flex-col" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} style={{ color: 'hsl(var(--primary))' }} />
                <h2 className="font-barlow text-xl font-bold">MONTHLY DONATIONS</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">AI-tracked donation trends across all countries (2026)</p>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MONTHLY_DATA}>
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ fontFamily: 'DM Mono', fontSize: 12 }}
                    />
                    <Bar dataKey="donations" fill="#c0152a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl border bg-card p-6 h-full flex flex-col" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-1">
                <Award size={18} style={{ color: 'hsl(var(--primary))' }} />
                <h2 className="font-barlow text-xl font-bold">TOP DONORS — HALL OF FAME</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Ranked by AI-verified total donations</p>
              <div className="flex-1 space-y-3">
                {TOP_DONORS.map(d => (
                  <div key={d.rank} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: d.rank === 1 ? 'rgba(192,21,42,0.06)' : 'transparent', border: d.rank === 1 ? '1px solid rgba(192,21,42,0.2)' : '1px solid transparent' }}>
                    <div className="font-barlow text-lg font-bold w-6 text-center" style={{ color: d.rank <= 3 ? '#c0152a' : 'hsl(var(--muted-foreground))' }}>#{d.rank}</div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs text-white bg-primary shrink-0">{d.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.country}</div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="font-barlow font-bold text-sm" style={{ color: '#c0152a' }}>{d.bloodGroup}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-barlow font-bold">{d.donations}</div>
                      <div className="text-xs font-mono-dm px-1.5 py-0.5 rounded" style={{ background: `${badgeColors[d.badge]}18`, color: badgeColors[d.badge] }}>{d.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                <Link to="/profile" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                  View Full Leaderboard <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER SECTION ─────────────────────── */}
      <section className="py-16" style={{ background: '#0d0a0b' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-barlow text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
            JOIN 142,891 DONORS SAVING LIVES WITH AI
          </h2>
          <p className="text-base mb-8 text-pretty" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Register in 2 minutes. AI activates your profile immediately. Every donation earns you honor badges and saves up to 3 lives.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/donor?tab=register" className="inline-flex items-center gap-2 px-8 py-3 rounded font-semibold transition-all hover:opacity-90 bg-primary text-white">
              <Droplets size={18} fill="#fff" /> Register as Donor
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-2 px-8 py-3 rounded font-semibold border transition-all hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              <Zap size={18} /> Ask AI Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
