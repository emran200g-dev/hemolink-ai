import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, ChevronDown, CheckCircle2, AlertCircle, Droplets,
  User, Phone, MapPin,
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { BLOOD_GROUPS, COUNTRIES } from '@/types/types';
import { toast } from 'sonner';

/* ─────────── Shared helpers ─────────── */
function BloodBtn({ group, selected, onSelect }: { group: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="h-11 rounded text-sm font-semibold transition-all border"
      style={{
        background: selected ? '#c0152a' : 'transparent',
        color: selected ? '#fff' : 'hsl(var(--foreground))',
        borderColor: selected ? '#c0152a' : 'hsl(var(--border))',
      }}
    >
      {group}
    </button>
  );
}

function SelectField({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-normal mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
        {label}{required && ' *'}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-10 rounded border text-sm px-3 pr-8 bg-background appearance-none"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function TextField({
  label, placeholder, value, onChange, type = 'text', required,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-normal mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded border px-3 text-sm bg-background"
        style={{ borderColor: 'hsl(var(--border))' }}
      />
    </div>
  );
}

/* ─────────── Donor Registration Tab ─────────── */
function DonorRegistrationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', bloodGroup: 'O+', phone: '', whatsapp: '',
    country: 'Egypt', city: 'Cairo', age: '', weight: '',
    lastDonated: '', available: true,
  });
  const [eligibilityResult, setEligibilityResult] = useState<{ eligible: boolean; reason: string; recommendation: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [registering, setRegistering] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.name === form.country);

  const checkEligibility = async () => {
    if (!form.age || !form.weight) { toast.error('Enter age and weight first.'); return; }
    setCheckingEligibility(true);
    setEligibilityResult(null);
    const { data, error } = await supabase.functions.invoke('ai-donor-match', {
      body: {
        mode: 'eligibility',
        donors: [{ age: parseInt(form.age), weight: parseInt(form.weight), lastDonated: form.lastDonated }],
        bloodGroup: form.bloodGroup, city: form.city, country: form.country,
      },
    });
    setCheckingEligibility(false);
    if (error || !data) { toast.error('AI check failed'); return; }
    try {
      const result = JSON.parse(data.result);
      setEligibilityResult(result);
      (window as any).pendo?.track('ai_eligibility_check_completed', {
        eligible: result.eligible,
        blood_group: form.bloodGroup,
        age: parseInt(form.age),
        weight: parseInt(form.weight),
        has_last_donated: !!form.lastDonated,
        reason: String(result.reason || '').substring(0, 100),
      });
    } catch {
      setEligibilityResult({ eligible: true, reason: 'AI analysis complete', recommendation: data.result || 'You appear eligible.' });
      (window as any).pendo?.track('ai_eligibility_check_completed', {
        eligible: true,
        blood_group: form.bloodGroup,
        age: parseInt(form.age),
        weight: parseInt(form.weight),
        has_last_donated: !!form.lastDonated,
        reason: 'AI analysis complete',
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.weight || !form.phone) {
      toast.error('Please fill all required fields.'); return;
    }
    setRegistering(true);
    const { error } = await supabase.from('donors').insert({
      name: form.name, age: parseInt(form.age), weight: parseInt(form.weight),
      blood_group: form.bloodGroup, country: form.country, city: form.city,
      phone: form.phone, whatsapp: form.whatsapp || null,
      available: form.available, last_donated: form.lastDonated || null,
      donations_count: 0,
    });
    setRegistering(false);
    if (error) { toast.error('Registration failed: ' + error.message); return; }
    (window as any).pendo?.track('donor_registration_completed', {
      blood_group: form.bloodGroup,
      country: form.country,
      city: form.city,
      available: form.available,
      has_whatsapp: !!form.whatsapp,
      age: parseInt(form.age),
      weight: parseInt(form.weight),
    });
    toast.success('🎉 Registered as HemoLink donor! AI has activated your profile.');
    navigate('/profile');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border bg-card p-6 md:p-8" style={{ borderColor: 'hsl(var(--border))' }}>
        <h2 className="font-barlow text-2xl font-bold tracking-wide mb-6">DONOR REGISTRATION</h2>

        <div className="space-y-5">
          {/* Row: Full Name + Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Full Name" placeholder="Your full name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <div>
              <label className="block text-sm font-normal mb-1.5">Blood Group *</label>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_GROUPS.map(g => (
                  <BloodBtn key={g} group={g} selected={form.bloodGroup === g} onSelect={() => setForm(f => ({ ...f, bloodGroup: g }))} />
                ))}
              </div>
            </div>
          </div>

          {/* Row: Phone + WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Phone Number" placeholder="+1 234 567 8900" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} required />
            <TextField label="WhatsApp Number" placeholder="+1 234 567 8900" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
          </div>

          {/* Row: Country + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField
              label="Country" value={form.country} required
              onChange={v => setForm(f => ({ ...f, country: v, city: COUNTRIES.find(c => c.name === v)?.cities[0] ?? '' }))}
              options={COUNTRIES.map(c => c.name)}
            />
            <SelectField
              label="City" value={form.city} required
              onChange={v => setForm(f => ({ ...f, city: v }))}
              options={(selectedCountry?.cities ?? []) as unknown as string[]}
            />
          </div>

          {/* Row: Age + Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Age" placeholder="18–65 years" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} type="number" required />
            <TextField label="Weight (kg)" placeholder="Min. 50kg" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} type="number" required />
          </div>

          {/* Last donation date */}
          <TextField label="Last Donation Date (optional)" placeholder="" value={form.lastDonated} onChange={v => setForm(f => ({ ...f, lastDonated: v }))} type="date" />

          {/* Availability toggle */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, available: !f.available }))}
              className="w-11 h-6 rounded-full relative transition-all shrink-0"
              style={{ background: form.available ? '#c0152a' : 'hsl(var(--muted-foreground) / 0.35)' }}
            >
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm" style={{ left: form.available ? '1.375rem' : '0.125rem' }} />
            </button>
            <span className="text-sm flex-1">Currently available to donate</span>
            <span className="text-xs font-mono-dm font-bold" style={{ color: form.available ? '#16a34a' : '#94a3b8' }}>
              {form.available ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {/* AI Eligibility */}
          <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(192,21,42,0.2)', background: 'rgba(192,21,42,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap size={13} style={{ color: '#c0152a' }} />
                <span className="text-sm font-semibold">AI Eligibility Check</span>
              </div>
              <button
                type="button"
                onClick={checkEligibility}
                disabled={checkingEligibility || !form.age || !form.weight}
                className="px-3 py-1 rounded text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: '#c0152a' }}
              >
                {checkingEligibility ? 'Checking...' : 'Check Now'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">AI will verify your eligibility based on age, weight and last donation date.</p>
            {eligibilityResult && (
              <div className="mt-3 p-3 rounded border" style={{
                borderColor: eligibilityResult.eligible ? 'rgba(22,163,74,0.3)' : 'rgba(192,21,42,0.3)',
                background: eligibilityResult.eligible ? 'rgba(22,163,74,0.05)' : 'rgba(192,21,42,0.05)',
              }}>
                <div className="flex items-center gap-2 mb-1">
                  {eligibilityResult.eligible
                    ? <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                    : <AlertCircle size={13} style={{ color: '#c0152a' }} />
                  }
                  <span className="text-sm font-semibold" style={{ color: eligibilityResult.eligible ? '#16a34a' : '#c0152a' }}>
                    {eligibilityResult.eligible ? 'Eligible to Donate!' : 'Not Currently Eligible'}
                  </span>
                </div>
                <p className="text-xs">{eligibilityResult.reason}</p>
                {eligibilityResult.recommendation && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{eligibilityResult.recommendation}</p>
                )}
              </div>
            )}
          </div>

          {/* AI Commitment Notice */}
          <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(192,21,42,0.35)', background: 'rgba(192,21,42,0.04)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} style={{ color: '#c0152a' }} />
              <span className="text-sm font-semibold" style={{ color: '#c0152a' }}>AI Commitment Notice</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
              By registering, you agree to respond to AI-sent donation requests within 2 hours. Your contact
              details will only be shared with verified hospitals and patient families after you accept a request.
            </p>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={registering}
            className="w-full h-12 rounded font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#c0152a' }}
          >
            {registering
              ? 'Registering...'
              : <><Droplets size={16} fill="#fff" color="#fff" /> Register as Blood Donor</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Donee / Patient Registration Tab ─────────── */
function DoneeRegistrationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: '', requesterName: '', relation: '',
    bloodGroup: 'O+', hospital: '', city: '', country: 'Egypt',
    surgeryDate: '', urgency: 'HIGH', medicalNotes: '',
    phone: '', whatsapp: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.name === form.country);

  const handleSubmit = async () => {
    if (!form.patientName || !form.requesterName || !form.hospital || !form.phone || !form.city) {
      toast.error('Please fill all required fields.'); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('blood_requests').insert({
      patient_name: form.patientName,
      requester_name: form.requesterName,
      blood_group: form.bloodGroup,
      hospital: form.hospital,
      city: form.city,
      country: form.country,
      surgery_date: form.surgeryDate || null,
      urgency: form.urgency as 'CRITICAL' | 'HIGH' | 'MODERATE',
      medical_condition: form.medicalNotes || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) { toast.error('Submission failed: ' + error.message); return; }
    (window as any).pendo?.track('blood_request_submitted', {
      blood_group: form.bloodGroup,
      urgency: form.urgency,
      country: form.country,
      city: form.city,
      hospital: form.hospital,
      has_surgery_date: !!form.surgeryDate,
      has_medical_notes: !!form.medicalNotes,
    });
    toast.success('🩸 Blood request submitted! AI is matching donors now.');
    navigate('/profile');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border bg-card p-6 md:p-8" style={{ borderColor: 'hsl(var(--border))' }}>
        <h2 className="font-barlow text-2xl font-bold tracking-wide mb-6">PATIENT / DONEE REGISTRATION</h2>

        <div className="space-y-5">
          {/* Row: Patient Name + Requester Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Patient Name" placeholder="Full patient name" value={form.patientName} onChange={v => setForm(f => ({ ...f, patientName: v }))} required />
            <TextField label="Your Name (Requester)" placeholder="Family member name" value={form.requesterName} onChange={v => setForm(f => ({ ...f, requesterName: v }))} required />
          </div>

          {/* Row: Relation + Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Relation to Patient" placeholder="e.g. Son, Daughter, Friend" value={form.relation} onChange={v => setForm(f => ({ ...f, relation: v }))} />
            <div>
              <label className="block text-sm font-normal mb-1.5">Blood Group Needed *</label>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_GROUPS.map(g => (
                  <BloodBtn key={g} group={g} selected={form.bloodGroup === g} onSelect={() => setForm(f => ({ ...f, bloodGroup: g }))} />
                ))}
              </div>
            </div>
          </div>

          {/* Row: Hospital + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Hospital Name" placeholder="Name of hospital" value={form.hospital} onChange={v => setForm(f => ({ ...f, hospital: v }))} required />
            <SelectField
              label="City" value={form.city || (selectedCountry?.cities[0] ?? '')} required
              onChange={v => setForm(f => ({ ...f, city: v }))}
              options={(selectedCountry?.cities ?? []) as unknown as string[]}
            />
          </div>

          {/* Row: Country + Surgery Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField
              label="Country" value={form.country} required
              onChange={v => setForm(f => ({ ...f, country: v, city: COUNTRIES.find(c => c.name === v)?.cities[0] ?? '' }))}
              options={COUNTRIES.map(c => c.name)}
            />
            <TextField label="Surgery / Operation Date" placeholder="" value={form.surgeryDate} onChange={v => setForm(f => ({ ...f, surgeryDate: v }))} type="date" />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-normal mb-1.5">Urgency Level *</label>
            <div className="flex gap-2">
              {[
                { level: 'CRITICAL', color: '#ff3b30' },
                { level: 'HIGH', color: '#f59e0b' },
                { level: 'MODERATE', color: '#3b82f6' },
              ].map(({ level, color }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, urgency: level }))}
                  className="flex-1 h-10 rounded text-xs font-bold tracking-wider transition-all border"
                  style={{
                    background: form.urgency === level ? color : 'transparent',
                    color: form.urgency === level ? '#fff' : 'hsl(var(--muted-foreground))',
                    borderColor: form.urgency === level ? color : 'hsl(var(--border))',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-sm font-normal mb-1.5">Medical Condition / Notes</label>
            <textarea
              value={form.medicalNotes}
              onChange={e => setForm(f => ({ ...f, medicalNotes: e.target.value }))}
              placeholder="Brief medical condition or additional notes..."
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm bg-background resize-none"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>

          {/* Row: Phone + WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Phone Number" placeholder="+1 234 567 8900" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} required />
            <TextField label="WhatsApp Number" placeholder="+1 234 567 8900" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
          </div>

          {/* AI notice */}
          <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(192,21,42,0.35)', background: 'rgba(192,21,42,0.04)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} style={{ color: '#c0152a' }} />
              <span className="text-sm font-semibold" style={{ color: '#c0152a' }}>AI Matching Notice</span>
            </div>
            <p className="text-xs leading-relaxed">
              After submission, HemoLink AI will immediately scan for matching donors near your hospital and
              send urgent notifications. You will be contacted when a donor accepts.
            </p>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 rounded font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#c0152a' }}
          >
            {submitting
              ? 'Submitting...'
              : <><Zap size={16} /> Submit Blood Request</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Register Page ─────────── */
type RegTab = 'donor' | 'donee';

export default function RegisterPage() {
  const [tab, setTab] = useState<RegTab>('donor');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark hero header */}
      <div className="px-4 md:px-8 py-8" style={{ background: '#0d0a0b' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} style={{ color: '#c0152a' }} />
            <span className="text-xs font-mono-dm tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
              JOIN THE NETWORK
            </span>
          </div>
          <h1 className="font-barlow text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            REGISTER
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setTab('donor')}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all border"
              style={
                tab === 'donor'
                  ? { background: '#c0152a', borderColor: '#c0152a', color: '#fff' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }
              }
            >
              <Droplets size={14} />
              Register as Donor
            </button>
            <button
              onClick={() => setTab('donee')}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all border"
              style={
                tab === 'donee'
                  ? { background: '#c0152a', borderColor: '#c0152a', color: '#fff' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }
              }
            >
              <User size={14} />
              Request Blood (Donee)
            </button>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 px-4 md:px-8 py-8" style={{ background: 'hsl(var(--background))' }}>
        {tab === 'donor' ? <DonorRegistrationForm /> : <DoneeRegistrationForm />}
      </div>
    </div>
  );
}
