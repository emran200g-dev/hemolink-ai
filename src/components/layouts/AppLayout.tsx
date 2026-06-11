import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Bell, User, Zap, X, Menu, Home, Search, MessageSquare, ClipboardPlus, Map } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { to: '/',         label: 'Home',     exact: true, icon: Home },
  { to: '/donor',    label: 'Donor',    icon: Search },
  { to: '/map',      label: 'Map',      icon: Map },
  { to: '/chat',     label: 'Chat',     icon: MessageSquare },
  { to: '/register', label: 'Register', icon: ClipboardPlus },
  { to: '/profile',  label: 'Profile',  icon: User },
];

const NOTIFS = [
  { msg: 'AI matched donor Omar Hassan (O+) — 2.3km from Al-Ahly Hospital', time: '2m ago', type: 'match' },
  { msg: 'URGENT: Patient at DHM Hospital needs B- blood. Surgery in 4h', time: '15m ago', type: 'urgent' },
  { msg: 'Sara Ahmed accepted donation request for City General', time: '1h ago', type: 'accept' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#0d0a0b', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-primary">
              <Droplets size={18} color="#fff" fill="#fff" />
            </div>
            <span className="font-barlow text-xl font-bold text-white tracking-wide hidden sm:block">
              HEMO<span style={{ color: '#ff3b30' }}>LINK</span>
            </span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-mono-dm bg-primary text-white hidden sm:block">AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ to, label, exact, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-sm"
                style={isActive(to, exact)
                  ? { background: 'hsl(var(--primary))', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.55)' }}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(192,21,42,0.2)' }}>
              <Zap size={12} style={{ color: '#ff3b30' }} />
              <span className="font-mono-dm text-xs" style={{ color: '#ff3b30' }}>AI ACTIVE</span>
            </div>

            {/* Notification */}
            <div className="relative">
              <button
                className="relative w-8 h-8 rounded flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
              >
                <Bell size={16} color="#fff" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white bg-primary text-xs font-mono-dm">3</span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 rounded-lg shadow-2xl border z-50 overflow-hidden bg-card" style={{ borderColor: 'hsl(var(--border))' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--border))' }}>
                    <span className="font-barlow text-base font-bold">AI NOTIFICATIONS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary text-white">3 new</span>
                      <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                    </div>
                  </div>
                  {NOTIFS.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors" style={{ borderColor: 'hsl(var(--border))' }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.type === 'urgent' ? '#ff3b30' : n.type === 'match' ? '#2a9d8f' : '#f4a261' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">{n.msg}</p>
                        <p className="text-xs mt-0.5 text-muted-foreground font-mono-dm">{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-center">
                    <Link to="/chat" onClick={() => setNotifOpen(false)} className="text-xs text-primary hover:underline">View all in Chat →</Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--primary))', background: '#1a1015' }}>
              <User size={14} style={{ color: 'hsl(var(--primary))' }} />
            </Link>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Menu">
                  <Menu size={16} color="#fff" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0 bg-card">
                <div className="px-4 py-4 border-b flex items-center gap-2" style={{ background: '#0d0a0b', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Droplets size={18} fill="#fff" color="#fff" />
                  <span className="font-barlow text-lg font-bold text-white">HEMO<span style={{ color: '#ff3b30' }}>LINK</span> AI</span>
                </div>
                <nav className="p-4 flex flex-col gap-1">
                  {navItems.map(({ to, label, exact, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-all"
                      style={isActive(to, exact)
                        ? { background: 'hsl(var(--primary))', color: '#fff' }
                        : { color: 'hsl(var(--foreground))' }}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden sticky bottom-0 z-50 border-t grid grid-cols-6" style={{ background: '#0d0a0b', borderColor: 'rgba(255,255,255,0.08)' }}>
        {navItems.map(({ to, label, exact, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 py-2 transition-all"
            style={{ opacity: isActive(to, exact) ? 1 : 0.4 }}
          >
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: isActive(to, exact) ? 'hsl(var(--primary))' : 'transparent' }}>
              <Icon size={16} color="#fff" />
            </div>
            <span className="text-white text-xs">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
