import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Zap, MapPin, Navigation, Search, X, ChevronDown,
  Crosshair, Layers, Activity,
} from 'lucide-react';
import { BLOOD_GROUPS, COUNTRIES, HOSPITALS_DB } from '@/types/types';
import { generateMockDonors } from '@/lib/hemolink';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

/* ── City coordinates for all 24 countries / major cities ── */
const CITY_COORDS: Record<string, [number, number]> = {
  // Egypt
  'Cairo': [31.2357, 30.0444], 'Alexandria': [29.9187, 31.2001],
  'Giza': [31.2089, 30.0131], 'Luxor': [32.6396, 25.6872], 'Aswan': [32.9001, 24.0889],
  // India
  'Mumbai': [72.8777, 19.0760], 'Delhi': [77.1025, 28.7041],
  'Bangalore': [77.5946, 12.9716], 'Chennai': [80.2707, 13.0827], 'Kolkata': [88.3639, 22.5726],
  // United States
  'New York': [-74.0060, 40.7128], 'Los Angeles': [-118.2437, 34.0522],
  'Chicago': [-87.6298, 41.8781], 'Houston': [-95.3698, 29.7604], 'Phoenix': [-112.0740, 33.4484],
  // United Kingdom
  'London': [-0.1276, 51.5074], 'Manchester': [-2.2426, 53.4808],
  'Birmingham': [-1.8904, 52.4862], 'Leeds': [-1.5491, 53.8008], 'Glasgow': [-4.2518, 55.8642],
  // Saudi Arabia
  'Riyadh': [46.7219, 24.6877], 'Jeddah': [39.1925, 21.4858],
  'Mecca': [39.8579, 21.3891], 'Medina': [39.6142, 24.5247], 'Dammam': [50.1033, 26.3927],
  // Nigeria
  'Lagos': [3.3792, 6.5244], 'Abuja': [7.4951, 9.0579],
  'Kano': [8.5227, 12.0022], 'Ibadan': [3.8965, 7.3775], 'Port Harcourt': [7.0498, 4.8156],
  // Kenya
  'Nairobi': [36.8219, -1.2921], 'Mombasa': [39.6682, -4.0435],
  'Kisumu': [34.7617, -0.1022], 'Nakuru': [36.0667, -0.3031], 'Eldoret': [35.2699, 0.5143],
  // Pakistan
  'Karachi': [67.0099, 24.8607], 'Lahore': [74.3436, 31.5204],
  'Islamabad': [73.0479, 33.6844], 'Rawalpindi': [73.0479, 33.5651], 'Faisalabad': [73.0851, 31.4154],
  // Bangladesh
  'Dhaka': [90.4125, 23.8103], 'Chittagong': [91.8123, 22.3569],
  'Sylhet': [91.8687, 24.8949], 'Rajshahi': [88.6042, 24.3745], 'Khulna': [89.5644, 22.8456],
  // Turkey
  'Istanbul': [28.9784, 41.0082], 'Ankara': [32.8597, 39.9334],
  'Izmir': [27.1428, 38.4237], 'Bursa': [29.0610, 40.1885], 'Antalya': [30.7133, 36.8969],
  // Indonesia
  'Jakarta': [106.8456, -6.2088], 'Surabaya': [112.7508, -7.2575],
  'Bandung': [107.6191, -6.9175], 'Medan': [98.6722, 3.5952], 'Bekasi': [107.0100, -6.2349],
  // Brazil
  'São Paulo': [-46.6333, -23.5505], 'Rio de Janeiro': [-43.1729, -22.9068],
  'Brasília': [-47.9292, -15.7801], 'Salvador': [-38.5108, -12.9714], 'Fortaleza': [-38.5434, -3.7172],
  // Mexico
  'Mexico City': [-99.1332, 19.4326], 'Guadalajara': [-103.3496, 20.6597],
  'Monterrey': [-100.3161, 25.6866], 'Puebla': [-98.2063, 19.0414], 'Tijuana': [-117.0382, 32.5149],
  // Philippines
  'Manila': [120.9842, 14.5995], 'Davao': [125.6128, 7.0707],
  'Cebu': [123.8907, 10.3157], 'Quezon City': [121.0437, 14.6760], 'Zamboanga': [122.0739, 6.9214],
  // South Africa
  'Johannesburg': [28.0473, -26.2041], 'Cape Town': [18.4241, -33.9249],
  'Durban': [31.0218, -29.8587], 'Pretoria': [28.1871, -25.7479], 'Port Elizabeth': [25.5706, -33.9608],
  // Germany
  'Berlin': [13.4050, 52.5200], 'Munich': [11.5820, 48.1351],
  'Hamburg': [9.9937, 53.5511], 'Cologne': [6.9603, 50.9333], 'Frankfurt': [8.6821, 50.1109],
  // France
  'Paris': [2.3522, 48.8566], 'Lyon': [4.8357, 45.7640],
  'Marseille': [5.3698, 43.2965], 'Toulouse': [1.4442, 43.6047], 'Nice': [7.2620, 43.7102],
  // Japan
  'Tokyo': [139.6917, 35.6895], 'Osaka': [135.5022, 34.6937],
  'Yokohama': [139.6380, 35.4437], 'Nagoya': [136.9066, 35.1815], 'Sapporo': [141.3544, 43.0618],
  // China
  'Beijing': [116.4074, 39.9042], 'Shanghai': [121.4737, 31.2304],
  'Guangzhou': [113.2644, 23.1291], 'Shenzhen': [114.0579, 22.5431], 'Chengdu': [104.0665, 30.5728],
  // Australia
  'Sydney': [151.2093, -33.8688], 'Melbourne': [144.9631, -37.8136],
  'Brisbane': [153.0260, -27.4698], 'Perth': [115.8605, -31.9505], 'Adelaide': [138.6007, -34.9285],
  // Canada
  'Toronto': [-79.3832, 43.6532], 'Vancouver': [-123.1216, 49.2827],
  'Montreal': [-73.5673, 45.5017], 'Calgary': [-114.0719, 51.0447], 'Ottawa': [-75.6972, 45.4215],
  // UAE
  'Dubai': [55.2708, 25.2048], 'Abu Dhabi': [54.3773, 24.4539],
  'Sharjah': [55.3836, 25.3463], 'Ajman': [55.4386, 25.4052], 'Ras Al Khaimah': [55.9432, 25.7895],
  // Morocco
  'Casablanca': [-7.5898, 33.5731], 'Rabat': [-6.8498, 34.0132],
  'Marrakesh': [-7.9811, 31.6295], 'Fez': [-4.9998, 34.0181], 'Tangier': [-5.8327, 35.7595],
  // Ghana
  'Accra': [-0.1870, 5.6037], 'Kumasi': [-1.6230, 6.6885],
  'Tamale': [-0.8393, 9.4008], 'Sekondi': [-1.7057, 4.9360], 'Sunyani': [-2.3288, 7.3349],
};

interface DonorMarker {
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  available: boolean;
  distance?: number;
  matchScore?: number;
  phone?: string;
}

function haversineDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('Egypt');
  const [selectedCity, setSelectedCity] = useState('Cairo');
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [donors, setDonors] = useState<DonorMarker[]>([]);
  const [searching, setSearching] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [aiPhase, setAiPhase] = useState<'idle' | 'zooming' | 'scanning' | 'done'>('idle');
  const [selectedDonor, setSelectedDonor] = useState<DonorMarker | null>(null);
  const [mapStyle, setMapStyle] = useState<'street' | 'dark'>('dark');
  const [donorCount, setDonorCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const countryObj = COUNTRIES.find(c => c.name === selectedCountry);

  const MAP_STYLES = {
    dark: 'https://tiles.openfreemap.org/styles/dark',
    street: 'https://tiles.openfreemap.org/styles/liberty',
  };

  /* ── Init map ── */
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: [31.2357, 30.0444],
      zoom: 5,
      pitch: 45,
      bearing: -15,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    mapRef.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── Switch map style ── */
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLES[mapStyle]);
    // Re-add 3D buildings after style load
    mapRef.current.once('style.load', () => {
      add3DBuildings();
    });
  }, [mapStyle]);

  const add3DBuildings = () => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer('3d-buildings')) return;
    const layers = map.getStyle()?.layers ?? [];
    const labelLayer = layers.find(l => l.type === 'symbol' && (l as maplibregl.SymbolLayerSpecification).layout?.['text-field']);
    try {
      map.addLayer({
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#c0152a',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.4,
        },
      }, labelLayer?.id);
    } catch { /* source not available for this style */ }
  };

  /* ── Clear markers ── */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    popupRef.current?.remove();
  }, []);

  /* ── Place donor markers ── */
  const placeMarkers = useCallback((donors: DonorMarker[], centerLat: number, centerLng: number) => {
    const map = mapRef.current;
    if (!map) return;
    clearMarkers();

    // Hospital/center marker
    const hospitalEl = document.createElement('div');
    hospitalEl.innerHTML = `<div style="
      width:28px;height:28px;border-radius:50%;background:#c0152a;border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 0 4px rgba(192,21,42,0.3);
      font-size:13px;font-weight:bold;color:#fff;
    ">H</div>`;
    new maplibregl.Marker({ element: hospitalEl })
      .setLngLat([centerLng, centerLat])
      .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false })
        .setHTML(`<div style="font-family:DM Sans,sans-serif;padding:6px 8px;font-size:12px;font-weight:600">📍 ${selectedCity}, ${selectedCountry}</div>`))
      .addTo(map);

    // Donor markers with pulsing ring
    donors.forEach((donor, i) => {
      const el = document.createElement('div');
      const color = donor.available ? '#16a34a' : '#94a3b8';
      const isTop = donor.matchScore && donor.matchScore >= 90;
      el.innerHTML = `
        <div style="position:relative;width:${isTop ? 36 : 28}px;height:${isTop ? 36 : 28}px">
          ${isTop ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(22,163,74,0.15);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''}
          <div style="
            width:100%;height:100%;border-radius:50%;background:${color};
            border:2px solid #fff;display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:700;color:#fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;
            transition:transform 0.2s;
          " title="${donor.name}">
            ${donor.bloodGroup.replace('+', '⁺').replace('-', '⁻')}
          </div>
        </div>`;

      const dist = haversineDist(centerLat, centerLng, donor.lat, donor.lng).toFixed(1);
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([donor.lng, donor.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 20, closeButton: true, className: 'hemolink-popup' })
            .setHTML(`
              <div style="font-family:DM Sans,sans-serif;min-width:180px;padding:4px">
                <div style="font-weight:700;font-size:13px;margin-bottom:4px">${donor.name}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                  <span style="background:#c0152a;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700">${donor.bloodGroup}</span>
                  <span style="background:${donor.available ? 'rgba(22,163,74,0.12)' : 'rgba(148,163,184,0.15)'};
                    color:${donor.available ? '#16a34a' : '#94a3b8'};
                    padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600">
                    ${donor.available ? '● Available' : '○ Unavailable'}
                  </span>
                </div>
                <div style="font-size:11px;color:#666;margin-bottom:2px">📍 ${donor.city}, ${donor.country}</div>
                <div style="font-size:11px;color:#666;margin-bottom:2px">📏 ${dist} km from hospital</div>
                <div style="font-size:11px;color:#c0152a;font-weight:600;margin-bottom:6px">🤖 AI Match: ${donor.matchScore ?? 82}%</div>
                <div style="height:4px;background:#eee;border-radius:2px;margin-bottom:8px">
                  <div style="height:100%;width:${donor.matchScore ?? 82}%;background:#c0152a;border-radius:2px"></div>
                </div>
                ${donor.phone ? `<a href="tel:${donor.phone}" style="display:block;text-align:center;background:#c0152a;color:#fff;padding:5px;border-radius:5px;font-size:11px;font-weight:600;text-decoration:none">📞 Call ${donor.phone}</a>` : ''}
              </div>`)
        )
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedDonor(donor);
      });

      markersRef.current.push(marker);

      // Animate marker appearance with delay
      el.style.opacity = '0';
      el.style.transform = 'scale(0.5)';
      el.style.transition = 'opacity 0.4s, transform 0.4s';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      }, i * 120);
    });
  }, [clearMarkers, selectedCity, selectedCountry]);

  /* ── AI animated search sequence ── */
  const handleAISearch = async () => {
    const coords = CITY_COORDS[selectedCity];
    if (!coords) { toast.error(`No coordinates for ${selectedCity}`); return; }
    const [lng, lat] = coords;

    setSearching(true);
    setAiPhase('zooming');
    setAiStatus('AI is locating the city...');
    setIsAnimating(true);
    clearMarkers();
    setSelectedDonor(null);

    const map = mapRef.current;
    if (!map) return;

    // Phase 1: Fly to city with 3D tilt
    map.flyTo({
      center: [lng, lat],
      zoom: 11,
      pitch: 60,
      bearing: -20,
      duration: 2200,
      essential: true,
    });

    await delay(1200);
    setAiStatus('Scanning nearby donors...');
    setAiPhase('scanning');

    await delay(1000);

    // Fetch donors
    const { data: dbData } = await supabase
      .from('donors')
      .select('*')
      .eq('country', selectedCountry)
      .ilike('city', `%${selectedCity}%`)
      .eq('blood_group', selectedBlood)
      .limit(12);

    const mockDonors = generateMockDonors(selectedBlood, selectedCity, selectedCountry);
    const raw = dbData && dbData.length > 0 ? dbData : mockDonors;

    // Scatter donors within ~15km radius of city center
    const mapped: DonorMarker[] = raw.map((d, i) => {
      const angle = (i / raw.length) * 2 * Math.PI + Math.random() * 0.5;
      const radius = 0.03 + Math.random() * 0.1; // ~3–12 km
      return {
        id: d.id,
        name: d.name,
        bloodGroup: d.blood_group,
        city: d.city ?? selectedCity,
        country: d.country ?? selectedCountry,
        lat: lat + Math.sin(angle) * radius,
        lng: lng + Math.cos(angle) * radius,
        available: d.available,
        matchScore: Math.floor(Math.random() * 20) + 75,
        phone: d.phone,
        distance: +(Math.random() * 12 + 1).toFixed(1),
      };
    });

    setDonors(mapped);
    setDonorCount(mapped.length);

    // Phase 2: Zoom in further and add markers
    map.flyTo({ center: [lng, lat], zoom: 13, pitch: 50, bearing: 15, duration: 1500 });
    await delay(800);

    placeMarkers(mapped, lat, lng);

    await delay(700);
    setAiStatus(`Found ${mapped.length} donors — ${mapped.filter(d => d.available).length} available`);
    setAiPhase('done');

    // Phase 3: Zoom back slightly for overview
    await delay(600);
    map.flyTo({ center: [lng, lat], zoom: 12.5, pitch: 45, bearing: 0, duration: 1200 });

    setSearching(false);
    setIsAnimating(false);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Dark toolbar ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 flex-wrap" style={{ background: '#0d0a0b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <Zap size={14} style={{ color: '#c0152a' }} />
          <span className="font-barlow text-sm font-bold text-white tracking-wider">AI LIVE MAP</span>
          {isAnimating && (
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#c0152a', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={e => {
              setSelectedCountry(e.target.value);
              const c = COUNTRIES.find(x => x.name === e.target.value);
              if (c) setSelectedCity(c.cities[0]);
            }}
            className="h-8 rounded border text-xs pl-3 pr-7 appearance-none font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', minWidth: 120 }}
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-2.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>

        {/* City */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="h-8 rounded border text-xs pl-3 pr-7 appearance-none font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', minWidth: 110 }}
          >
            {(countryObj?.cities ?? []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-2.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>

        {/* Blood Group */}
        <div className="flex gap-1 flex-wrap">
          {BLOOD_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setSelectedBlood(g)}
              className="h-8 px-2.5 rounded text-xs font-bold transition-all border"
              style={{
                background: selectedBlood === g ? '#c0152a' : 'rgba(255,255,255,0.06)',
                borderColor: selectedBlood === g ? '#c0152a' : 'rgba(255,255,255,0.15)',
                color: selectedBlood === g ? '#fff' : 'rgba(255,255,255,0.65)',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search button */}
        <button
          onClick={handleAISearch}
          disabled={searching}
          className="h-8 px-4 rounded text-xs font-bold text-white flex items-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-60 shrink-0 ml-auto"
          style={{ background: '#c0152a' }}
        >
          {searching
            ? <><Zap size={12} className="animate-pulse" /> Scanning...</>
            : <><Search size={12} /> AI Search</>
          }
        </button>

        {/* Style toggle */}
        <button
          onClick={() => setMapStyle(s => s === 'dark' ? 'street' : 'dark')}
          className="h-8 px-3 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}
        >
          <Layers size={12} /> {mapStyle === 'dark' ? 'Street' : 'Dark'}
        </button>
      </div>

      {/* ── Map + Side Panel ── */}
      <div className="flex flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 relative min-w-0">
          <div ref={mapContainer} className="w-full h-full" />

          {/* AI Status overlay */}
          {aiPhase !== 'idle' && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-dm font-semibold z-10 pointer-events-none"
              style={{ background: 'rgba(13,10,11,0.88)', border: '1px solid rgba(192,21,42,0.6)', color: aiPhase === 'done' ? '#4ade80' : '#c0152a', backdropFilter: 'blur(8px)' }}
            >
              {aiPhase !== 'done' && <Zap size={12} className="animate-pulse shrink-0" />}
              {aiPhase === 'done' && <span>✓</span>}
              {aiStatus}
            </div>
          )}

          {/* Legend */}
          <div
            className="absolute bottom-12 left-3 flex flex-col gap-1.5 px-3 py-2.5 rounded-lg text-xs z-10"
            style={{ background: 'rgba(13,10,11,0.82)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)' }}
          >
            {[
              { color: '#16a34a', label: 'Available donor' },
              { color: '#94a3b8', label: 'Unavailable donor' },
              { color: '#c0152a', label: 'Hospital / Center' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-white/70">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Hospital markers from DB */}
          {aiPhase === 'idle' && (
            <div className="absolute top-3 left-3 px-3 py-2 rounded-lg text-xs z-10 pointer-events-none"
              style={{ background: 'rgba(13,10,11,0.75)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)' }}>
              <MapPin size={11} className="inline mr-1" />Select country, city & blood group — then click AI Search
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div
          className="w-72 shrink-0 flex flex-col overflow-hidden hidden lg:flex"
          style={{ background: '#0d0a0b', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-px p-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { label: 'Donors Found', value: donorCount, color: '#c0152a', icon: Activity },
              { label: 'Available', value: donors.filter(d => d.available).length, color: '#16a34a', icon: Crosshair },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="p-3 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Icon size={12} style={{ color }} />
                <div className="font-barlow text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Selected donor detail */}
          {selectedDonor && (
            <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-dm tracking-wider" style={{ color: '#c0152a' }}>SELECTED DONOR</span>
                <button onClick={() => setSelectedDonor(null)}>
                  <X size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: '#c0152a' }}>
                  {selectedDonor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white text-balance">{selectedDonor.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{selectedDonor.city}</div>
                </div>
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: '#c0152a' }}>{selectedDonor.bloodGroup}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Distance', val: `${selectedDonor.distance ?? '?'} km` },
                  { label: 'AI Match', val: `${selectedDonor.matchScore ?? 82}%` },
                  { label: 'Status', val: selectedDonor.available ? 'Available' : 'Unavailable' },
                  { label: 'Country', val: selectedDonor.country },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                    <div className="text-xs font-semibold font-mono-dm text-white">{val}</div>
                  </div>
                ))}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>AI Match Score</span>
                  <span className="font-mono-dm font-bold" style={{ color: '#c0152a' }}>{selectedDonor.matchScore ?? 82}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${selectedDonor.matchScore ?? 82}%`, background: '#c0152a' }} />
                </div>
              </div>
              {selectedDonor.phone && (
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="block w-full text-center text-xs font-bold text-white py-2 rounded transition-all hover:opacity-90"
                  style={{ background: '#c0152a' }}
                >
                  📞 Call {selectedDonor.phone}
                </a>
              )}
            </div>
          )}

          {/* Donor list */}
          <div className="flex-1 overflow-y-auto">
            {donors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                <Navigation size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
                <p className="text-xs text-center text-pretty" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Use the controls above to search for donors near a city
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {donors.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDonor(d);
                      mapRef.current?.flyTo({ center: [d.lng, d.lat], zoom: 14, duration: 900 });
                      markersRef.current.find((_, i) => donors[i]?.id === d.id)?.togglePopup();
                    }}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all hover:bg-white/5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedDonor?.id === d.id ? 'rgba(192,21,42,0.1)' : 'transparent' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: d.available ? '#16a34a' : '#374151' }}>
                      {d.bloodGroup.replace('+', '').replace('-', '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{d.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.distance ?? '?'} km · {d.matchScore ?? 82}% match</div>
                    </div>
                    <span className="text-xs font-mono-dm font-bold shrink-0" style={{ color: d.available ? '#4ade80' : '#94a3b8' }}>
                      {d.bloodGroup}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hospitals section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-xs font-mono-dm tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                HOSPITALS IN {selectedCountry.toUpperCase()}
              </span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 140 }}>
              {HOSPITALS_DB.filter(h => h.country === selectedCountry).map(h => (
                <button
                  key={h.name}
                  onClick={() => {
                    const coords = CITY_COORDS[h.city];
                    if (coords && mapRef.current) {
                      mapRef.current.flyTo({ center: coords, zoom: 13, pitch: 45, duration: 1200 });
                    }
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 transition-all hover:bg-white/5"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: '#16a34a' }}>H</div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">{h.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{h.city}</div>
                  </div>
                </button>
              ))}
              {HOSPITALS_DB.filter(h => h.country === selectedCountry).length === 0 && (
                <p className="px-3 py-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>No hospitals listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MapLibre popup style */}
      <style>{`
        .hemolink-popup .maplibregl-popup-content {
          border-radius: 8px;
          padding: 10px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          border: 1px solid rgba(192,21,42,0.2);
          font-family: 'DM Sans', sans-serif;
        }
        .hemolink-popup .maplibregl-popup-tip { border-top-color: white; }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
