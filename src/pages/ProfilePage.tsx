import React, { useState } from 'react';
import {
  Droplets, Award, Zap, MapPin, Phone, Calendar, Shield,
  TrendingUp, Clock, CheckCircle, AlertCircle, Activity,
  MessageSquare, User, Users, ChevronRight, Edit,
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { BADGES } from '@/lib/hemolink';

/* ─── Mock data ─── */
const DONOR_PROFILE = {
  name: 'Ahmed Mohamed',
  bloodGroup: 'O+',
  location: 'Cairo, Egypt',
  phone: '+20 100 000 0001',
  whatsapp: '+20 100 000 0001',
  available: true,
  donations: 12,
  livesImpacted: 34,
  matchScore: 87,
  nextEligible: '2026-08-15',
  memberSince: 'Jan 2025',
  rank: 24,
  responseRate: 94,
  avgResponse: '18 min',
  areaCoverage: '15 km',
};

const DONATION_HISTORY = [
  { date: '2026-04-12', hospital: 'Cairo General Hospital', patientType: 'Emergency Surgery', bloodGroup: 'O+', status: 'completed', points: 150 },
  { date: '2026-01-20', hospital: 'Al-Ahly Medical Center', patientType: 'Cardiac Patient', bloodGroup: 'O+', status: 'completed', points: 200 },
  { date: '2025-10-05', hospital: 'Dar Al-Fouad Hospital', patientType: 'Cancer Treatment', bloodGroup: 'O+', status: 'completed', points: 150 },
  { date: '2025-07-18', hospital: 'Shifa International', patientType: 'Accident Trauma', bloodGroup: 'O+', status: 'completed', points: 300 },
  { date: '2025-04-22', hospital: 'Cairo University Hospital', patientType: 'Pediatric Patient', bloodGroup: 'O+', status: 'completed', points: 250 },
];

const DONEE_PROFILE = {
  name: 'Sarah Ahmed (Family)',
  relation: 'Patient\'s Sister',
  patientName: 'Hassan Ahmed',
  bloodGroup: 'B-',
  location: 'Cairo, Egypt',
};

const DONEE_REQUESTS = [
  { date: '2026-04-10', hospital: 'Cairo General Hospital', bloodGroup: 'B-', urgency: 'CRITICAL', status: 'matched', donor: 'Omar Hassan' },
  { date: '2026-01-15', hospital: 'Al-Ahly Medical', bloodGroup: 'B-', urgency: 'HIGH', status: 'completed', donor: 'Priya Sharma' },
  { date: '2025-09-03', hospital: 'Dar Al-Fouad Hospital', bloodGroup: 'B-', urgency: 'MODERATE', status: 'completed', donor: 'Sara Ahmed' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Omar Hassan', bloodGroup: 'O+', country: 'Egypt', donations: 47, badge: 'Platinum Guardian', isMe: false },
  { rank: 2, name: 'Priya Sharma', bloodGroup: 'B+', country: 'India', donations: 41, badge: 'Gold Lifesaver', isMe: false },
  { rank: 3, name: 'Carlos Mendoza', bloodGroup: 'A+', country: 'Mexico', donations: 38, badge: 'Gold Lifesaver', isMe: false },
  { rank: 23, name: '...', bloodGroup: '—', country: '', donations: 0, badge: '', isMe: false },
  { rank: 24, name: 'Ahmed Mohamed (You)', bloodGroup: 'O+', country: 'Egypt', donations: 12, badge: 'Silver Hero', isMe: true },
  { rank: 25, name: 'Yuki Tanaka', bloodGroup: 'O-', country: 'Japan', donations: 11, badge: 'Silver Hero', isMe: false },
];

const badgeColors: Record<string, string> = {
  'Platinum Guardian': '#6366f1',
  'Gold Lifesaver': '#f59e0b',
  'Silver Hero': '#94a3b8',
};

const urgencyStyle = (u: string) => {
  if (u === 'CRITICAL') return { bg: '#c0152a18', color: '#c0152a' };
  if (u === 'HIGH') return { bg: '#f9731618', color: '#f97316' };
  return { bg: '#2d6a8f18', color: '#2d6a8f' };
};

/* ─── Radial chart for AI match score ─── */
function AIMatchGauge({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: 'hsl(var(--primary))' }];
  return (
    <div className="relative shrink-0" style={{ width: 112, height: 112 }}>
      <ResponsiveContainer width={112} height={112}>
        <RadialBarChart innerRadius="65%" outerRadius="90%" data={data} startAngle={225} endAngle={-45}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={6} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-barlow text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{score}%</span>
        <span className="text-xs text-muted-foreground font-mono-dm">AI Score</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [mode, setMode] = useState<'donor' | 'donee'>('donor');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page header + mode toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-barlow text-3xl font-bold flex items-center gap-2">
            <User size={24} className="text-primary" /> MY PROFILE
          </h1>
          <p className="text-sm text-muted-foreground">Manage your donor/donee identity and track your impact.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl p-1 bg-muted self-start sm:self-auto">
          <button
            onClick={() => setMode('donor')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={mode === 'donor' ? { background: '#c0152a', color: '#fff' } : { color: 'hsl(var(--muted-foreground))' }}
          >
            <span className="flex items-center gap-1.5"><Droplets size={14} fill={mode === 'donor' ? '#fff' : 'transparent'} /> Donor Mode</span>
          </button>
          <button
            onClick={() => setMode('donee')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={mode === 'donee' ? { background: '#c0152a', color: '#fff' } : { color: 'hsl(var(--muted-foreground))' }}
          >
            <span className="flex items-center gap-1.5"><Users size={14} /> Donee Mode</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════ DONOR MODE ═══════════════════ */}
      {mode === 'donor' && (
        <div className="space-y-6">
          {/* Row 1: Profile card + AI score + stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile Card */}
            <div className="rounded-xl border bg-card p-5 flex flex-col gap-4" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 bg-primary">
                  {DONOR_PROFILE.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-base truncate">{DONOR_PROFILE.name}</h2>
                    <button className="text-muted-foreground hover:text-foreground shrink-0"><Edit size={14} /></button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono-dm text-white bg-primary">{DONOR_PROFILE.bloodGroup}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600 font-medium">Available</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { icon: MapPin,        label: 'location', value: DONOR_PROFILE.location },
                  { icon: Phone,         label: 'phone',    value: DONOR_PROFILE.phone },
                  { icon: MessageSquare, label: 'whatsapp', value: DONOR_PROFILE.whatsapp },
                  { icon: Calendar,      label: 'member',   value: `Member since ${DONOR_PROFILE.memberSince}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-muted-foreground">
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Eligibility */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={14} style={{ color: '#16a34a' }} />
                  <span className="font-medium" style={{ color: '#16a34a' }}>Eligible to donate</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono-dm">Next eligible: {DONOR_PROFILE.nextEligible}</p>
              </div>
            </div>

            {/* AI Match Score + Key stats */}
            <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-primary" />
                <span className="font-barlow text-lg font-bold">AI PERFORMANCE</span>
              </div>
              <div className="flex items-center justify-around">
                <AIMatchGauge score={DONOR_PROFILE.matchScore} />
                <div className="space-y-3">
                  {[
                    { label: 'Donations', value: String(DONOR_PROFILE.donations), icon: Droplets, color: '#c0152a' },
                    { label: 'Lives Impacted', value: String(DONOR_PROFILE.livesImpacted), icon: Activity, color: '#16a34a' },
                    { label: 'Global Rank', value: `#${DONOR_PROFILE.rank}`, icon: Award, color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <s.icon size={14} style={{ color: s.color }} />
                      <div>
                        <div className="font-barlow font-bold text-lg leading-none" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <span className="font-barlow text-lg font-bold">AI INSIGHTS</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Match Rate', value: `${DONOR_PROFILE.responseRate}%`, desc: 'Requests you matched vs received', color: '#c0152a', pct: DONOR_PROFILE.responseRate },
                  { label: 'Response Score', value: DONOR_PROFILE.avgResponse, desc: 'Average response time to requests', color: '#2a9d8f', pct: 78 },
                  { label: 'Lives Impacted', value: String(DONOR_PROFILE.livesImpacted), desc: 'Estimated lives saved (3× per donation)', color: '#16a34a', pct: 72 },
                  { label: 'Area Coverage', value: DONOR_PROFILE.areaCoverage, desc: 'Active donation radius', color: '#2d6a8f', pct: 55 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold font-mono-dm" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Badges */}
          <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-primary" />
              <h2 className="font-barlow text-lg font-bold">HONOR BADGES</h2>
              <span className="text-xs font-mono-dm text-muted-foreground ml-auto">{BADGES.filter(b => b.earned).length}/{BADGES.length} earned</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES.map(badge => (
                <div
                  key={badge.name}
                  className="rounded-xl border p-3 flex flex-col items-center gap-2 transition-all"
                  style={{
                    borderColor: badge.earned ? `${badge.color}40` : 'hsl(var(--border))',
                    background: badge.earned ? `${badge.color}0d` : 'transparent',
                    opacity: badge.earned ? 1 : 0.6,
                  }}
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="text-center">
                    <div className="font-semibold text-xs text-balance">{badge.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{badge.desc}</div>
                  </div>
                  {badge.earned
                    ? <div className="flex items-center gap-1 text-xs" style={{ color: badge.color }}><CheckCircle size={11} /> Earned</div>
                    : badge.progress !== undefined && (
                      <div className="w-full">
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${badge.progress}%`, background: badge.color }} />
                        </div>
                        <div className="text-xs text-center text-muted-foreground mt-0.5 font-mono-dm">{badge.progress}%</div>
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Donation history + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Donation history table */}
            <div className="lg:col-span-2 rounded-xl border bg-card p-5 flex flex-col" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-primary" />
                <h2 className="font-barlow text-lg font-bold">DONATION HISTORY</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                      {['Date', 'Hospital', 'Patient Type', 'Blood', 'Status', 'Points'].map(h => (
                        <th key={h} className="text-left text-xs font-mono-dm text-muted-foreground pb-2 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DONATION_HISTORY.map((d, i) => (
                      <tr key={i} className="border-b last:border-0" style={{ borderColor: 'hsl(var(--border))' }}>
                        <td className="py-2.5 pr-4 text-xs font-mono-dm whitespace-nowrap">{d.date}</td>
                        <td className="py-2.5 pr-4 text-sm whitespace-nowrap">{d.hospital}</td>
                        <td className="py-2.5 pr-4 text-sm whitespace-nowrap text-muted-foreground">{d.patientType}</td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs font-bold font-mono-dm px-1.5 py-0.5 rounded" style={{ background: '#c0152a18', color: '#c0152a' }}>{d.bloodGroup}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: '#16a34a' }}>
                            <CheckCircle size={11} /> {d.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-sm font-bold font-mono-dm" style={{ color: '#f59e0b' }}>+{d.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl border bg-card p-5 flex flex-col" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-primary" />
                <h2 className="font-barlow text-lg font-bold">LEADERBOARD</h2>
              </div>
              <div className="flex-1 space-y-1">
                {LEADERBOARD.map((d, i) => (
                  d.name === '...'
                    ? <div key={i} className="text-center text-xs text-muted-foreground py-2">· · ·</div>
                    : (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={d.isMe ? { background: 'rgba(192,21,42,0.07)', border: '1px solid rgba(192,21,42,0.2)' } : {}}
                      >
                        <span className="font-barlow font-bold text-sm w-6 text-center" style={{ color: d.rank <= 3 ? '#c0152a' : 'hsl(var(--muted-foreground))' }}>#{d.rank}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: d.isMe ? '#c0152a' : '#0d0a0b' }}>
                          {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{d.isMe ? 'You' : d.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{d.country}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-barlow font-bold text-sm">{d.donations}</div>
                          {d.badge && (
                            <div className="text-xs font-mono-dm px-1 py-0.5 rounded" style={{ background: `${badgeColors[d.badge] ?? '#888'}18`, color: badgeColors[d.badge] ?? '#888' }}>{d.badge.split(' ')[0]}</div>
                          )}
                        </div>
                      </div>
                    )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ DONEE MODE ═══════════════════ */}
      {mode === 'donee' && (
        <div className="space-y-6">

          {/* Donee info card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 bg-primary">
                  {DONEE_PROFILE.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="font-bold text-base">{DONEE_PROFILE.name}</h2>
                  <p className="text-sm text-muted-foreground">{DONEE_PROFILE.relation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Patient: <strong>{DONEE_PROFILE.patientName}</strong></span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold font-mono-dm text-white bg-primary">{DONEE_PROFILE.bloodGroup}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin size={13} /> {DONEE_PROFILE.location}
              </div>
              <button className="w-full h-10 rounded font-semibold text-sm text-white bg-primary hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Droplets size={16} fill="#fff" /> Post New Blood Request
              </button>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-primary" />
                <h2 className="font-barlow text-lg font-bold">REQUEST STATS</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Requests', value: '3', color: '#c0152a', icon: AlertCircle },
                  { label: 'Successfully Matched', value: '3', color: '#16a34a', icon: CheckCircle },
                  { label: 'Avg Match Time', value: '6.2 min', color: '#2d6a8f', icon: Clock },
                  { label: 'AI Score', value: '98%', color: '#f59e0b', icon: Zap },
                ].map(s => (
                  <div key={s.label} className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: `${s.color}0d`, border: `1px solid ${s.color}25` }}>
                    <s.icon size={18} style={{ color: s.color }} />
                    <div className="font-barlow font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blood request history */}
          <div className="rounded-xl border bg-card p-5" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <h2 className="font-barlow text-lg font-bold">BLOOD REQUEST HISTORY</h2>
              </div>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-3 py-1.5 rounded hover:opacity-90 transition-all">
                <Droplets size={14} fill="#fff" /> New Request
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                    {['Date', 'Hospital', 'Blood Group', 'Urgency', 'Status', 'Matched Donor'].map(h => (
                      <th key={h} className="text-left text-xs font-mono-dm text-muted-foreground pb-2 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DONEE_REQUESTS.map((r, i) => {
                    const us = urgencyStyle(r.urgency);
                    return (
                      <tr key={i} className="border-b last:border-0" style={{ borderColor: 'hsl(var(--border))' }}>
                        <td className="py-2.5 pr-4 text-xs font-mono-dm whitespace-nowrap">{r.date}</td>
                        <td className="py-2.5 pr-4 text-sm whitespace-nowrap">{r.hospital}</td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs font-bold font-mono-dm px-1.5 py-0.5 rounded" style={{ background: '#c0152a18', color: '#c0152a' }}>{r.bloodGroup}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs font-mono-dm px-1.5 py-0.5 rounded" style={{ background: us.bg, color: us.color }}>{r.urgency}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: r.status === 'matched' ? '#16a34a' : '#2d6a8f' }}>
                            <CheckCircle size={11} /> {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-sm whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-muted-foreground" /> {r.donor}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI tips */}
          <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(192,21,42,0.2)', background: 'rgba(192,21,42,0.03)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-primary" />
              <h3 className="font-semibold">AI Recommendations for Faster Matching</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                { icon: '📍', tip: 'Include exact hospital address and wing/floor number to help donors navigate faster.' },
                { icon: '⏰', tip: 'Specify surgery time window clearly. AI prioritizes requests with tight time constraints.' },
                { icon: '📱', tip: 'Keep WhatsApp active. 82% of donors prefer WhatsApp for faster coordination.' },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-card border" style={{ borderColor: 'hsl(var(--border))' }}>
                  <span className="text-lg">{t.icon}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed text-pretty">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
