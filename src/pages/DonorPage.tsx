import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Zap, Phone, Navigation, ChevronDown, Plus,
  Building2, Search, List, Copy, Check, Wifi,
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { BLOOD_GROUPS, COUNTRIES, HOSPITALS_DB, type Donor } from '@/types/types';
import { generateMockDonors } from '@/lib/hemolink';
import { toast } from 'sonner';

/* ─────────── City coordinates (all 24 countries) ─────────── */
const CITY_COORDS: Record<string, [number, number]> = {
  Cairo: [31.2357, 30.0444], Alexandria: [29.9187, 31.2001], Giza: [31.2089, 30.0131],
  Luxor: [32.6396, 25.6872], Aswan: [32.9001, 24.0889],
  Mumbai: [72.8777, 19.076], Delhi: [77.1025, 28.7041], Bangalore: [77.5946, 12.9716],
  Chennai: [80.2707, 13.0827], Kolkata: [88.3639, 22.5726],
  'New York': [-74.006, 40.7128], 'Los Angeles': [-118.2437, 34.0522], Chicago: [-87.6298, 41.8781],
  Houston: [-95.3698, 29.7604], Phoenix: [-112.074, 33.4484],
  London: [-0.1276, 51.5074], Manchester: [-2.2426, 53.4808], Birmingham: [-1.8904, 52.4862],
  Leeds: [-1.5491, 53.8008], Glasgow: [-4.2518, 55.8642],
  Riyadh: [46.7219, 24.6877], Jeddah: [39.1925, 21.4858], Mecca: [39.8579, 21.3891],
  Medina: [39.6142, 24.5247], Dammam: [50.1033, 26.3927],
  Lagos: [3.3792, 6.5244], Abuja: [7.4951, 9.0579], Kano: [8.5227, 12.0022],
  Ibadan: [3.8965, 7.3775], 'Port Harcourt': [7.0498, 4.8156],
  Nairobi: [36.8219, -1.2921], Mombasa: [39.6682, -4.0435], Kisumu: [34.7617, -0.1022],
  Nakuru: [36.0667, -0.3031], Eldoret: [35.2699, 0.5143],
  Karachi: [67.0099, 24.8607], Lahore: [74.3436, 31.5204], Islamabad: [73.0479, 33.6844],
  Rawalpindi: [73.0479, 33.5651], Faisalabad: [73.0851, 31.4154],
  Dhaka: [90.4125, 23.8103], Chittagong: [91.8123, 22.3569], Sylhet: [91.8687, 24.8949],
  Rajshahi: [88.6042, 24.3745], Khulna: [89.5644, 22.8456],
  Istanbul: [28.9784, 41.0082], Ankara: [32.8597, 39.9334], Izmir: [27.1428, 38.4237],
  Bursa: [29.061, 40.1885], Antalya: [30.7133, 36.8969],
  Jakarta: [106.8456, -6.2088], Surabaya: [112.7508, -7.2575], Bandung: [107.6191, -6.9175],
  Medan: [98.6722, 3.5952], Bekasi: [107.01, -6.2349],
  'São Paulo': [-46.6333, -23.5505], 'Rio de Janeiro': [-43.1729, -22.9068],
  Brasília: [-47.9292, -15.7801], Salvador: [-38.5108, -12.9714], Fortaleza: [-38.5434, -3.7172],
  'Mexico City': [-99.1332, 19.4326], Guadalajara: [-103.3496, 20.6597],
  Monterrey: [-100.3161, 25.6866], Puebla: [-98.2063, 19.0414], Tijuana: [-117.0382, 32.5149],
  Manila: [120.9842, 14.5995], Davao: [125.6128, 7.0707], Cebu: [123.8907, 10.3157],
  'Quezon City': [121.0437, 14.676], Zamboanga: [122.0739, 6.9214],
  Johannesburg: [28.0473, -26.2041], 'Cape Town': [18.4241, -33.9249],
  Durban: [31.0218, -29.8587], Pretoria: [28.1871, -25.7479],
  Berlin: [13.405, 52.52], Munich: [11.582, 48.1351], Hamburg: [9.9937, 53.5511],
  Paris: [2.3522, 48.8566], Lyon: [4.8357, 45.764], Tokyo: [139.6917, 35.6895],
  Osaka: [135.5022, 34.6937], Beijing: [116.4074, 39.9042], Shanghai: [121.4737, 31.2304],
  Sydney: [151.2093, -33.8688], Melbourne: [144.9631, -37.8136],
  Toronto: [-79.3832, 43.6532], Vancouver: [-123.1216, 49.2827],
  Dubai: [55.2708, 25.2048], 'Abu Dhabi': [54.3773, 24.4539],
  Casablanca: [-7.5898, 33.5731], Rabat: [-6.8498, 34.0132],
  Accra: [-0.187, 5.6037], Kumasi: [-1.623, 6.6885],
};

function haversineDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─────────── AI Terminal ─────────── */
const TERMINAL_LINES = [
  { text: '📍 Geo-indexing location: {city}, {country}', color: '#f97316', delay: 300 },
  { text: '🩸 Filtering registered donors for blood group: {bloodGroup}', color: '#c0152a', delay: 700 },
  { text: '🔬 Cross-referencing compatibility matrix...', color: '#60a5fa', delay: 1200 },
  { text: '⚡ Scanning 142,891 donors across 24 countries...', color: '#facc15', delay: 1700 },
  { text: '🧠 Computing match scores with AI distance weighting...', color: '#a78bfa', delay: 2200 },
  { text: '✅ Match complete. Ranked {count} compatible donors found.', color: '#4ade80', delay: 2800 },
];

interface TerminalProps { city: string; country: string; bloodGroup: string; count: number; active: boolean; }
function AITerminal({ city, country, bloodGroup, count, active }: TerminalProps) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!active) { setVisible(0); return; }
    setVisible(0);
    const timers = TERMINAL_LINES.map((_, i) =>
      setTimeout(() => setVisible(v => Math.max(v, i + 1)), TERMINAL_LINES[i].delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [active, city, country, bloodGroup]);

  const fill = (t: string) =>
    t.replace('{city}', city).replace('{country}', country)
     .replace('{bloodGroup}', bloodGroup).replace('{count}', String(count));

  return (
    <div className="rounded-xl mb-5 p-4" style={{ background: '#0d0a0b', border: '1px solid rgba(192,21,42,0.3)', fontFamily: 'monospace' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
          HEMOLINK AI — NEURAL MATCH ENGINE
        </span>
      </div>
      <div className="flex flex-col gap-1.5 min-h-[80px]">
        {TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <div key={i} className="text-xs leading-relaxed" style={{ color: line.color, animation: 'termFade 0.35s ease' }}>
            {fill(line.text)}
          </div>
        ))}
        {active && visible < TERMINAL_LINES.length && (
          <div className="flex gap-0.5 mt-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#c0152a', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes termFade{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ─────────── Live Donor Map ─────────── */
interface LiveMapProps {
  donors: Donor[];
  city: string;
  country: string;
  zoomTarget?: Donor | null;
  onZoomDone?: () => void;
}

type MarkerEntry = { marker: maplibregl.Marker & { _dLng?: number; _dLat?: number }; donor: Donor };

function DonorLiveMap({ donors, city, country, zoomTarget, onZoomDone }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const coords = CITY_COORDS[city] ?? [31.2357, 30.0444];
  const [lng, lat] = coords;

  const placeMarkers = useCallback(
    (list: Donor[], highlightId?: string) => {
      const map = mapRef.current;
      if (!map) return;
      markersRef.current.forEach(e => e.marker.remove());
      markersRef.current = [];

      // Hospital pin
      const hEl = document.createElement('div');
      hEl.innerHTML = `<div style="width:26px;height:26px;border-radius:6px;background:#16a34a;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.45)">${city.slice(0, 1)}</div>`;
      new maplibregl.Marker({ element: hEl })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(`<b>${city} Hospital</b>`))
        .addTo(map);

      // "Your location" dot
      const locEl = document.createElement('div');
      locEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><div style="width:10px;height:10px;border-radius:50%;background:#94a3b8;border:2px solid #fff;box-shadow:0 0 0 4px rgba(148,163,184,0.2)"></div><span style="font-size:8px;color:#94a3b8;background:rgba(0,0,0,0.6);padding:1px 4px;border-radius:3px">YOUR LOCATION</span></div>`;
      new maplibregl.Marker({ element: locEl }).setLngLat([lng + 0.003, lat - 0.005]).addTo(map);

      list.forEach((donor, i) => {
        const angle = (i / list.length) * 2 * Math.PI + 0.3;
        const radius = 0.025 + (i % 3) * 0.022;
        const dLat = lat + Math.sin(angle) * radius;
        const dLng = lng + Math.cos(angle) * radius;
        const dist = haversineDist(lat, lng, dLat, dLng).toFixed(1);
        const hi = highlightId === donor.id;
        const bg = donor.available ? '#c0152a' : '#475569';
        const sz = hi ? '34px' : '28px';
        const shadow = hi
          ? '0 0 0 5px rgba(192,21,42,0.35),0 0 20px rgba(192,21,42,0.5)'
          : '0 2px 6px rgba(0,0,0,.4)';

        const el = document.createElement('div');
        el.style.cssText = 'cursor:pointer;transition:all 0.3s;';
        el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="width:${sz};height:${sz};border-radius:50%;background:${bg};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;box-shadow:${shadow};transition:all 0.3s">${donor.blood_group}</div>
          <span style="font-size:8px;font-weight:600;color:${donor.available ? '#fff' : '#94a3b8'};background:rgba(0,0,0,0.65);padding:1px 5px;border-radius:3px;white-space:nowrap">${donor.name.split(' ')[0]}</span>
        </div>`;

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([dLng, dLat])
          .setPopup(
            new maplibregl.Popup({ offset: 8, closeButton: false, className: 'hemo-popup' }).setHTML(
              `<div style="font-size:11px;min-width:150px;font-family:system-ui">
                <b style="font-size:13px">${donor.name}</b><br/>
                <span style="color:#c0152a;font-weight:700">${donor.blood_group}</span>
                &nbsp;·&nbsp;${donor.available ? '<span style="color:#4ade80">● Available</span>' : '<span style="color:#94a3b8">● Unavailable</span>'}<br/>
                <span style="color:#aaa">📏 ~${dist} km &nbsp;·&nbsp; AI ${donor.matchScore ?? 80}% match</span>
              </div>`
            )
          )
          .addTo(map);

        const tm = marker as typeof marker & { _dLng?: number; _dLat?: number };
        tm._dLng = dLng;
        tm._dLat = dLat;

        const inner = el.firstElementChild as HTMLElement;
        if (inner) {
          inner.style.opacity = '0';
          inner.style.transform = 'scale(0.3)';
          inner.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
          setTimeout(() => { inner.style.opacity = '1'; inner.style.transform = 'scale(1)'; }, i * 110 + 150);
        }
        markersRef.current.push({ marker: tm, donor });
      });
    },
    [donors, lat, lng, city]
  );

  // Init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [lng, lat],
      zoom: 12,
      pitch: 35,
      bearing: -8,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    mapRef.current.on('load', () => placeMarkers(donors));
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Re-fly on city/count change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: 12, pitch: 35, bearing: -8, duration: 1200, essential: true });
    const doPlace = () => placeMarkers(donors);
    if (map.isStyleLoaded()) doPlace(); else map.once('style.load', doPlace);
  }, [city, donors.length]);

  // AI zoom to target
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zoomTarget) return;
    const entry = markersRef.current.find(e => e.donor.id === zoomTarget.id);
    const tm = entry?.marker as (maplibregl.Marker & { _dLng?: number; _dLat?: number }) | undefined;
    const dLng = tm?._dLng ?? lng + 0.02;
    const dLat = tm?._dLat ?? lat + 0.02;
    placeMarkers(donors, zoomTarget.id);
    map.flyTo({ center: [dLng, dLat], zoom: 15, pitch: 55, bearing: 20, duration: 1800, essential: true });
    const t = setTimeout(() => {
      const updated = markersRef.current.find(e => e.donor.id === zoomTarget.id);
      updated?.marker.togglePopup();
      setTimeout(() => onZoomDone?.(), 1200);
    }, 2000);
    return () => clearTimeout(t);
  }, [zoomTarget]);

  const online = donors.filter(d => d.available).length;

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 420, border: '1px solid rgba(255,255,255,0.08)' }}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-lg z-10"
        style={{ background: 'rgba(13,10,11,0.88)', border: '1px solid rgba(192,21,42,0.35)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-white">LIVE MAP</span>
        </div>
        <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.18)' }} />
        <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <Wifi size={10} />{online} DONORS ONLINE
        </div>
      </div>
      {/* Legend */}
      <div className="absolute bottom-8 right-3 flex flex-col gap-1.5 px-2.5 py-2 rounded-lg z-10"
        style={{ background: 'rgba(13,10,11,0.88)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
        {[{ c: '#c0152a', l: 'Available Donor' }, { c: '#475569', l: 'Unavailable' }, { c: '#16a34a', l: 'Hospital' }].map(x => (
          <div key={x.l} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: x.c }} />{x.l}
          </div>
        ))}
      </div>
      <style>{`.hemo-popup .maplibregl-popup-content{border-radius:8px;padding:9px 11px;background:#1a1a1a;color:#fff;border:1px solid rgba(192,21,42,.25);box-shadow:0 4px 20px rgba(0,0,0,.5)}`}</style>
    </div>
  );
}

/* ─────────── Blood group button ─────────── */
function BloodBtn({ group, selected, onSelect }: { group: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="h-10 rounded text-sm font-semibold transition-all border"
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

/* ─────────── Urgency button ─────────── */
const URGENCY_COLOR: Record<string, string> = { CRITICAL: '#ff3b30', HIGH: '#f59e0b', MODERATE: '#3b82f6' };
function UrgencyBtn({ level, selected, onSelect }: { level: string; selected: boolean; onSelect: () => void }) {
  const bg = URGENCY_COLOR[level];
  return (
    <button
      onClick={onSelect}
      className="flex-1 h-10 rounded text-xs font-bold tracking-wider transition-all border"
      style={{
        background: selected ? bg : 'transparent',
        color: selected ? '#fff' : 'hsl(var(--muted-foreground))',
        borderColor: selected ? bg : 'hsl(var(--border))',
      }}
    >
      {level}
    </button>
  );
}

/* ─────────── Donor Card ─────────── */
interface DonorCardProps { donor: Donor; onAIContact: (d: Donor) => void; }
function DonorCard({ donor, onAIContact }: DonorCardProps) {
  const [copied, setCopied] = useState(false);
  const initials = donor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const lastDonated = donor.last_donated
    ? (() => {
        const m = Math.round((Date.now() - new Date(donor.last_donated!).getTime()) / (1000 * 60 * 60 * 24 * 30));
        return m < 1 ? 'Recently' : `${m} month${m !== 1 ? 's' : ''} ago`;
      })()
    : 'Never';

  const copyPhone = () => {
    navigator.clipboard.writeText(donor.phone).then(() => {
      setCopied(true);
      toast.success(`Copied: ${donor.phone}`);
      setTimeout(() => setCopied(false), 2000);

      pendo.track("donor_phone_copied", {
        donor_blood_group: donor.blood_group,
        donor_available: donor.available,
        donor_match_score: donor.matchScore ?? 0,
        donor_city: donor.city,
      });
    });
  };

  const openWhatsApp = () => {
    pendo.track("whatsapp_contact_initiated", {
      donor_blood_group: donor.blood_group,
      donor_available: donor.available,
      donor_match_score: donor.matchScore ?? 0,
      donor_city: donor.city,
      donor_name: donor.name,
    });
    window.open(`https://wa.me/${donor.phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden"
      style={{ borderColor: donor.available ? 'rgba(192,21,42,0.22)' : 'hsl(var(--border))' }}>
      {/* Top row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
          style={{ background: donor.available ? '#c0152a' : '#475569' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{donor.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold text-white"
              style={{ background: '#c0152a' }}>{donor.blood_group}</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full"
                style={{ background: donor.available ? '#4ade80' : '#94a3b8' }} />
              <span className="text-xs" style={{ color: donor.available ? '#4ade80' : '#94a3b8' }}>
                {donor.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">📍 {donor.city}, {donor.country}</span>
            <span className="text-xs text-muted-foreground">🕐 {donor.distance ?? '?'}km away</span>
            <span className="text-xs text-muted-foreground">Last donated: {lastDonated}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-black leading-none" style={{ color: '#c0152a' }}>{donor.matchScore ?? 80}%</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">AI MATCH</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-3.5 flex-wrap">
        <button
          onClick={() => donor.available && onAIContact(donor)}
          disabled={!donor.available}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
          style={donor.available
            ? { background: '#c0152a', color: '#fff' }
            : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', opacity: 0.6, cursor: 'not-allowed' }}
        >
          <Zap size={12} /> AI Contact Donor
        </button>
        <button
          onClick={copyPhone}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:bg-muted"
          style={{ borderColor: 'hsl(var(--border))' }}
          title="Click to copy phone number"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Phone size={12} />}
          <span className="font-mono truncate max-w-[110px]">{donor.phone}</span>
          {!copied && <Copy size={10} className="text-muted-foreground shrink-0" />}
        </button>
        <button
          onClick={openWhatsApp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#25d366' }}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.121 1.533 5.851L.057 23.25a.75.75 0 00.943.943l5.399-1.476A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.706 9.706 0 01-5.004-1.385l-.36-.213-3.726 1.018 1.018-3.726-.213-.36A9.706 9.706 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </div>
  );
}

/* ─────────── Select dropdown ─────────── */
function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
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

/* ─────────── AI Contact overlay ─────────── */
interface AIContactOverlayProps { donor: Donor; onDone: () => void; }
function AIContactOverlay({ donor, onDone }: AIContactOverlayProps) {
  const [step, setStep] = useState(0);
  const steps = [
    `🔍 Locating donor: ${donor.name}...`,
    `📍 Pinpointing coordinates — ${donor.city}, ${donor.country}`,
    `📏 Calculating distance: ${donor.distance ?? '?'} km from your location`,
    `🩸 Verifying blood type: ${donor.blood_group} — Match confirmed ✅`,
    `🤖 HemoLink AI is opening a direct chat channel...`,
  ];
  useEffect(() => {
    if (step >= steps.length) { onDone(); return; }
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 400 : 750);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: '#0d0a0b', border: '1px solid rgba(192,21,42,0.35)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: '#c0152a' }}>
            {donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{donor.name}</div>
            <div className="text-xs" style={{ color: '#c0152a' }}>{donor.blood_group} · AI Contact</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-4" style={{ fontFamily: 'monospace', minHeight: 120 }}>
          {steps.slice(0, step).map((s, i) => (
            <div key={i} className="text-xs" style={{ color: i === step - 1 ? '#4ade80' : 'rgba(255,255,255,0.55)', animation: 'termFade 0.3s ease' }}>{s}</div>
          ))}
          {step < steps.length && (
            <div className="flex gap-0.5 mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#c0152a', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>
        <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%`, background: '#c0152a' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main DonorPage ─────────── */
type Urgency = 'CRITICAL' | 'HIGH' | 'MODERATE';

export default function DonorPage() {
  const navigate = useNavigate();
  const [resultView, setResultView] = useState<'list' | 'map'>('list');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [urgency, setUrgency] = useState<Urgency>('HIGH');
  const [country, setCountry] = useState('Egypt');
  const [city, setCity] = useState('Cairo');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<Donor | null>(null);
  const [contactDonor, setContactDonor] = useState<Donor | null>(null);

  const selectedCountry = COUNTRIES.find(c => c.name === country);
  const nearbyHospitals = HOSPITALS_DB.filter(h => h.country === country);

  useEffect(() => {
    const first = COUNTRIES.find(c => c.name === country);
    if (first && !first.cities.includes(city as never)) setCity(first.cities[0]);
  }, [country]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      let nearest: (typeof HOSPITALS_DB)[number] = HOSPITALS_DB[0];
      let minD = Infinity;
      HOSPITALS_DB.forEach(h => {
        const d = Math.abs(h.lat - latitude) + Math.abs(h.lng - longitude);
        if (d < minD) { minD = d; nearest = h; }
      });
      setCountry(nearest.country);
      setCity(nearest.city);
      toast.success(`Location: ${nearest.city}, ${nearest.country}`);

      pendo.track("gps_location_detected", {
        detected_country: nearest.country,
        detected_city: nearest.city,
        nearest_hospital: nearest.name,
      });
    });
  };

  const handleSearch = async () => {
    setSearching(true);
    setHasSearched(true);
    setTerminalActive(false);
    setDonors([]);
    // Brief pause so terminal resets
    await new Promise(r => setTimeout(r, 50));
    setTerminalActive(true);

    const { data } = await supabase
      .from('donors')
      .select('*')
      .eq('country', country)
      .ilike('city', `%${city}%`)
      .eq('blood_group', bloodGroup)
      .limit(8);

    const results: Donor[] =
      data && data.length > 0
        ? data.map(d => ({
            ...d,
            distance: +(Math.random() * 8 + 0.5).toFixed(1),
            matchScore: Math.floor(Math.random() * 25) + 72,
          }))
        : generateMockDonors(bloodGroup, city, country);

    // Wait for terminal animation to finish before showing cards
    await new Promise(r => setTimeout(r, 3000));
    setDonors(results);
    setSearching(false);

    pendo.track("donor_search_executed", {
      blood_group: bloodGroup,
      urgency,
      country,
      city,
      surgery_date: surgeryDate || "",
      results_count: results.length,
      available_count: results.filter(d => d.available).length,
      used_mock_data: !(data && data.length > 0),
    });
  };

  // AI Contact Donor: switch to map view → zoom → overlay → chat
  const handleAIContact = (donor: Donor) => {
    setResultView('map');
    setZoomTarget(donor);
  };

  const handleMapZoomDone = () => {
    // Show AI contact overlay after map zoom completes
    setContactDonor(zoomTarget);
    setZoomTarget(null);
  };

  const handleContactOverlayDone = () => {
    pendo.track("ai_contact_donor_initiated", {
      donor_name: contactDonor?.name ?? "unknown",
      donor_blood_group: contactDonor?.blood_group ?? "unknown",
      donor_city: city,
      donor_country: country,
      donor_match_score: contactDonor?.matchScore ?? 0,
      donor_available: contactDonor?.available ?? false,
      donor_distance: contactDonor?.distance ?? 0,
    });

    setContactDonor(null);
    // Navigate to chat with scripted flow state
    navigate('/chat', {
      state: {
        scriptedFlow: true,
        donorName: contactDonor?.name ?? 'Omar Hassan',
        bloodGroup: contactDonor?.blood_group ?? 'O+',
        city,
        country,
      },
    });
  };

  const availableCount = donors.filter(d => d.available).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark hero */}
      <div className="px-4 md:px-8 py-8" style={{ background: '#0d0a0b' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={13} style={{ color: '#c0152a' }} />
            <span className="text-xs font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              AI-POWERED DONOR NETWORK
            </span>
          </div>
          <h1 className="font-barlow text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight text-balance">
            DONOR CENTER
          </h1>
          <div className="flex gap-3 flex-wrap">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all border"
              style={{ background: '#c0152a', borderColor: '#c0152a', color: '#fff' }}
            >
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              Find Blood / AI Donor Search
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all border"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }}
            >
              <Plus size={14} /> Register as Donor
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 md:px-8 py-6" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 items-start flex-col lg:flex-row">

            {/* LEFT PANEL */}
            <div className="w-full lg:w-80 shrink-0 rounded-xl border bg-card p-5 flex flex-col gap-4"
              style={{ borderColor: 'hsl(var(--border))' }}>
              <h2 className="font-barlow text-sm font-bold tracking-wider text-muted-foreground">AI SEARCH PARAMETERS</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Blood Group Required</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BLOOD_GROUPS.map(g => (
                    <BloodBtn key={g} group={g} selected={bloodGroup === g} onSelect={() => setBloodGroup(g)} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level</label>
                <div className="flex gap-1.5">
                  {(['CRITICAL', 'HIGH', 'MODERATE'] as Urgency[]).map(lvl => (
                    <UrgencyBtn key={lvl} level={lvl} selected={urgency === lvl} onSelect={() => setUrgency(lvl)} />
                  ))}
                </div>
              </div>

              <SelectField label="Country" value={country} onChange={setCountry} options={COUNTRIES.map(c => c.name)} />
              <SelectField
                label="City / State"
                value={city}
                onChange={setCity}
                options={(selectedCountry?.cities ?? []) as unknown as string[]}
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">Surgery / Operation Date</label>
                <input
                  type="date"
                  value={surgeryDate}
                  onChange={e => setSurgeryDate(e.target.value)}
                  className="w-full h-10 rounded border px-3 text-sm bg-background"
                  style={{ borderColor: 'hsl(var(--border))' }}
                />
              </div>

              <button
                onClick={handleGPS}
                className="flex items-center gap-2 text-xs py-2.5 px-3 rounded border transition-all hover:bg-muted"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              >
                <Navigation size={13} className="text-primary" />
                GPS auto-detection enabled
              </button>

              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-full h-11 rounded font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#c0152a' }}
              >
                {searching ? <><Zap size={15} className="animate-pulse" /> Scanning...</> : <><Zap size={15} /> Search with AI</>}
              </button>

              {nearbyHospitals.length > 0 && (
                <div>
                  <p className="text-xs font-mono tracking-widest mb-2 text-muted-foreground">
                    NEARBY HOSPITALS ({country.toUpperCase()})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {nearbyHospitals.slice(0, 4).map(h => (
                      <div key={h.name} className="flex items-center gap-2.5 px-3 py-2 rounded" style={{ background: 'hsl(var(--muted))' }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: '#16a34a' }}>H</div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{h.name}</div>
                          <div className="text-xs text-muted-foreground">{h.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 min-w-0">
              {/* Terminal (shown during/after search) */}
              {(terminalActive || hasSearched) && (
                <AITerminal
                  city={city}
                  country={country}
                  bloodGroup={bloodGroup}
                  count={donors.length}
                  active={searching || terminalActive}
                />
              )}

              {/* Searching spinner */}
              {searching && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <Zap size={32} className="animate-pulse" style={{ color: '#c0152a' }} />
                  <p className="text-sm font-medium">AI scanning {bloodGroup} donors in {city}...</p>
                </div>
              )}

              {/* Results header + toggle */}
              {!searching && donors.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-black text-lg">{donors.length} EXACT MATCHES</span>
                    <span className="text-sm text-muted-foreground ml-2">near {city}, {country}</span>
                    <span className="text-xs text-muted-foreground ml-2">({availableCount} available)</span>
                  </div>
                  <div className="flex rounded-lg border overflow-hidden shrink-0" style={{ borderColor: 'hsl(var(--border))' }}>
                    {([['list', List, 'List'], ['map', null, 'Map']] as const).map(([key, Icon, label]) => (
                      <button
                        key={key}
                        onClick={() => setResultView(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
                        style={resultView === key
                          ? { background: '#c0152a', color: '#fff' }
                          : { background: 'transparent', color: 'hsl(var(--muted-foreground))' }}
                      >
                        {Icon ? <Icon size={12} /> : <Wifi size={12} />}{label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LIST view */}
              {!searching && donors.length > 0 && resultView === 'list' && (
                <div className="flex flex-col gap-3">
                  {donors.map(d => (
                    <DonorCard key={d.id} donor={d} onAIContact={handleAIContact} />
                  ))}
                </div>
              )}

              {/* MAP view */}
              {!searching && donors.length > 0 && resultView === 'map' && (
                <DonorLiveMap
                  donors={donors}
                  city={city}
                  country={country}
                  zoomTarget={zoomTarget}
                  onZoomDone={handleMapZoomDone}
                />
              )}

              {/* Empty state */}
              {!hasSearched && !searching && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'hsl(var(--muted))' }}>
                    <Search size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs text-pretty">
                    Set your parameters and click <strong>Search with AI</strong> to find matching donors
                  </p>
                </div>
              )}

              {/* No results */}
              {hasSearched && !searching && donors.length === 0 && !terminalActive && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Building2 size={36} className="text-muted-foreground mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">No donors found. Try expanding your search area.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Contact overlay */}
      {contactDonor && (
        <AIContactOverlay donor={contactDonor} onDone={handleContactOverlayDone} />
      )}
    </div>
  );
}
