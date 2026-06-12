import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Zap, CheckCheck, Phone, X, Menu, Activity,
} from 'lucide-react';

/* ─── Types ─── */
interface Message {
  id: number;
  role: 'ai' | 'user' | 'donor' | 'system' | 'hospital';
  content: string;
  time: string;
}

interface Thread {
  id: number;
  name: string;
  avatar: string;
  type: 'ai' | 'donor' | 'hospital';
  bloodGroup?: string;
  lastMsg: string;
  time: string;
  unread: number;
  status?: 'pending' | 'accepted' | 'declined';
  messages: Message[];
}

/* ─── Time helper ─── */
const now = new Date();
const fmt = (minAgo: number) => {
  const d = new Date(now.getTime() - minAgo * 60000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ─── Pre-loaded threads ─── */
const THREADS: Thread[] = [
  {
    id: 1,
    name: 'HemoLink AI Assistant',
    avatar: 'AI',
    type: 'ai',
    lastMsg: 'I found 3 compatible donors near Cairo General Hospital',
    time: fmt(2),
    unread: 2,
    messages: [
      { id: 1, role: 'system', content: '🤖 HemoLink AI is ready to coordinate blood donations. AI monitoring is active.', time: fmt(30) },
      { id: 2, role: 'ai', content: "Hello! I'm your AI blood donation coordinator. I've detected an urgent request at Cairo General Hospital for blood type O+ — a 34-year-old patient needs surgery in 6 hours. Shall I begin scanning for nearby donors?", time: fmt(20) },
      { id: 3, role: 'user', content: 'Yes please, scan for O+ donors in Cairo immediately.', time: fmt(18) },
      { id: 4, role: 'ai', content: '🧠 Scanning 142,891 registered donors...\nGeo-indexing Cairo, Egypt...\nFound 3 donors within 5km!\n\n📍 Omar Hassan — 1.2km — O+ — ✅ Available\n📍 Aisha Kamel — 2.7km — O+ — ✅ Available\n📍 Mina Girgis — 4.1km — O+ — 🕐 Pending\n\nShall I send AI-powered notification messages to all three?', time: fmt(15) },
      { id: 5, role: 'user', content: 'Yes, send them all immediately.', time: fmt(14) },
      { id: 6, role: 'ai', content: '✅ Notifications sent!\n\n• Omar Hassan — notified via SMS + in-app\n• Aisha Kamel — notified via WhatsApp + in-app\n• Mina Girgis — notified via SMS\n\nI\'ll update you as they respond. Estimated response time: 8–15 minutes. I\'m also coordinating directly with Cairo General Hospital\'s blood bank.', time: fmt(12) },
      { id: 7, role: 'ai', content: '🎉 Update: Omar Hassan has ACCEPTED the donation request!\n\nI\'ve shared the following with the patient\'s family:\n• Donor: Omar Hassan\n• Blood Group: O+\n• ETA: ~25 minutes\n• Contact: +20 100 123 4567\n\nI\'ve also opened a direct chat channel between Omar and the hospital coordinator.', time: fmt(2) },
    ],
  },
  {
    id: 2,
    name: 'Omar Hassan',
    avatar: 'OH',
    type: 'donor',
    bloodGroup: 'O+',
    lastMsg: "I'm on my way to the hospital now",
    time: fmt(5),
    unread: 1,
    status: 'accepted',
    messages: [
      { id: 1, role: 'system', content: '🤖 HemoLink AI connected you with Omar Hassan (O+) — 1.2km away. This chat is monitored for safety.', time: fmt(25) },
      { id: 2, role: 'ai', content: '📋 AI Briefing for Omar Hassan:\n\nPatient: Ahmed Al-Rashidi, 34 years old\nHospital: Cairo General Hospital, Floor 3, Blood Bank Unit\nSurgery: Today at 5:30 PM\nBlood Required: O+, 2 units\nContact: Dr. Mona Farid (+20 2 1234 5678)\n\nPlease confirm your availability.', time: fmt(22) },
      { id: 3, role: 'donor', content: 'I confirm. I can be there in 30 minutes. Is there parking?', time: fmt(20) },
      { id: 4, role: 'user', content: 'Yes, there\'s free parking at Gate B. Dr. Farid will meet you at the entrance.', time: fmt(18) },
      { id: 5, role: 'donor', content: 'Perfect. I last donated 3 months ago so I\'m eligible. See you soon.', time: fmt(15) },
      { id: 6, role: 'ai', content: '✅ Eligibility confirmed by AI health check:\n• Last donation: 3 months ago ✓\n• Waiting period: Passed ✓\n• Health status: Registered as healthy ✓\n\nETA updated on hospital dashboard.', time: fmt(10) },
      { id: 7, role: 'donor', content: "I'm on my way to the hospital now", time: fmt(5) },
    ],
  },
  {
    id: 3,
    name: 'Cairo General Hospital',
    avatar: 'CGH',
    type: 'hospital',
    lastMsg: 'Blood bank ready. Dr. Farid waiting at entrance.',
    time: fmt(8),
    unread: 0,
    messages: [
      { id: 1, role: 'system', content: '🏥 Official channel — Cairo General Hospital Blood Coordination Unit', time: fmt(40) },
      { id: 2, role: 'hospital', content: 'This is Dr. Mona Farid, blood bank coordinator. We need 2 units of O+ urgently for surgery at 17:30.', time: fmt(38) },
      { id: 3, role: 'ai', content: '🔍 HemoLink AI processing your request...\n\nBlood group O+ matched with 3 registered donors within 5km.\n\nNotifications dispatched. Estimated donor arrival: 25–35 minutes. We will update you in real time.', time: fmt(35) },
      { id: 4, role: 'hospital', content: 'Thank you! Please also notify us if any donor declines so we can escalate.', time: fmt(30) },
      { id: 5, role: 'ai', content: '✅ Auto-escalation activated. If a donor declines, AI will immediately re-scan and notify the next 3 closest donors. You will receive real-time updates here.', time: fmt(28) },
      { id: 6, role: 'hospital', content: 'Blood bank ready. Dr. Farid waiting at entrance.', time: fmt(8) },
    ],
  },
  {
    id: 4,
    name: 'Apollo Hospital',
    avatar: 'AH',
    type: 'hospital',
    bloodGroup: 'B-',
    lastMsg: 'Still waiting for B- donor response',
    time: fmt(45),
    unread: 3,
    status: 'pending',
    messages: [
      { id: 1, role: 'system', content: '🏥 Apollo Hospital Mumbai — Blood Request Channel', time: fmt(60) },
      { id: 2, role: 'hospital', content: 'We have a cardiac surgery patient requiring 3 units of B- blood. Surgery scheduled for tomorrow 09:00.', time: fmt(55) },
      { id: 3, role: 'ai', content: '🔍 Scanning Mumbai donors for B-...\n\nB- is a rare blood type (found in ~2% of population). Found 2 donors within 8km:\n\n• Sara Ahmed — 3.1km — B- — ⏳ Pending Response\n• Michael Fernandez — 7.8km — B- — ✅ Available\n\nNotifications sent with full surgery details.', time: fmt(50) },
      { id: 4, role: 'hospital', content: 'Still waiting for B- donor response', time: fmt(45) },
    ],
  },
];

/* ─── Message bubble ─── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const isAI = msg.role === 'ai';
  const isDonor = msg.role === 'donor';
  const isHospital = msg.role === 'hospital';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1"
          style={{ background: isAI ? '#c0152a' : isDonor ? '#2a9d8f' : '#2d6a8f' }}>
          {isAI ? '🤖' : isDonor ? 'D' : 'H'}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <span className="text-xs font-mono-dm mb-1 px-1" style={{ color: isAI ? 'hsl(var(--primary))' : isDonor ? '#2a9d8f' : '#2d6a8f' }}>
            {isAI ? 'HemoLink AI' : isDonor ? 'Donor' : 'Hospital'}
          </span>
        )}
        <div
          className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
          style={
            isUser
              ? { background: '#0d0a0b', color: '#fff', borderBottomRightRadius: 4 }
              : isAI
              ? { background: 'rgba(192,21,42,0.07)', border: '1px solid rgba(192,21,42,0.2)', color: 'hsl(var(--foreground))', borderBottomLeftRadius: 4 }
              : isDonor
              ? { background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.25)', color: 'hsl(var(--foreground))', borderBottomLeftRadius: 4 }
              : { background: 'rgba(45,106,143,0.1)', border: '1px solid rgba(45,106,143,0.25)', color: 'hsl(var(--foreground))', borderBottomLeftRadius: 4 }
          }
        >
          {msg.content}
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1 font-mono-dm flex items-center gap-1">
          {msg.time}
          {isUser && <CheckCheck size={11} style={{ color: '#2a9d8f' }} />}
        </span>
      </div>
    </div>
  );
}

/* ─── Thread item ─── */
function ThreadItem({ thread, active, onClick }: { thread: Thread; active: boolean; onClick: () => void }) {
  const typeColor = thread.type === 'ai' ? '#c0152a' : thread.type === 'donor' ? '#2a9d8f' : '#2d6a8f';
  const typeLabel = thread.type === 'ai' ? 'AI' : thread.type === 'donor' ? 'Donor' : 'Hospital';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-muted/50"
      style={{ background: active ? 'hsl(var(--secondary))' : 'transparent', borderLeft: active ? '3px solid hsl(var(--primary))' : '3px solid transparent' }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
        style={{ background: typeColor }}>
        {thread.avatar.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-semibold text-sm truncate">{thread.name}</span>
          <span className="text-xs text-muted-foreground font-mono-dm shrink-0">{thread.time}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs px-1 py-0.5 rounded font-mono-dm" style={{ background: `${typeColor}18`, color: typeColor }}>{typeLabel}</span>
          {thread.bloodGroup && <span className="text-xs font-mono-dm font-bold" style={{ color: '#c0152a' }}>{thread.bloodGroup}</span>}
          {thread.status === 'accepted' && <span className="text-xs text-green-600 font-mono-dm">✓ Accepted</span>}
          {thread.status === 'pending' && <span className="text-xs font-mono-dm" style={{ color: '#f97316' }}>⏳ Pending</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMsg}</p>
      </div>
      {thread.unread > 0 && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-primary shrink-0 mt-1">
          {thread.unread}
        </div>
      )}
    </button>
  );
}

/* ─── Scripted demo messages ─── */
interface ScriptedStep {
  role: 'ai' | 'user';
  content: string;
  delayBefore: number; // ms before this message appears
}

const SCRIPTED_STEPS: ScriptedStep[] = [
  {
    role: 'ai',
    content: "Hello! I'm your AI blood donation coordinator. I've detected an urgent request at Cairo General Hospital for blood type O+ — a 34-year-old patient needs surgery in 6 hours. Shall I begin scanning for nearby donors?",
    delayBefore: 600,
  },
  {
    role: 'user',
    content: 'Yes please, scan for O+ donors in Cairo immediately.',
    delayBefore: 2200,
  },
  {
    role: 'ai',
    content: '🧠 Scanning 142,891 registered donors...\nGeo-indexing Cairo, Egypt...\nFound 3 donors within 5km!\n\n📍 Omar Hassan — 1.2km — O+ — ✅ Available\n📍 Aisha Kamel — 2.7km — O+ — ✅ Available\n📍 Mina Girgis — 4.1km — O+ — 🕐 Pending\n\nShall I send AI-powered notification messages to all three?',
    delayBefore: 1800,
  },
  {
    role: 'user',
    content: 'Yes, send them all immediately.',
    delayBefore: 2500,
  },
  {
    role: 'ai',
    content: '🎉 Update: Omar Hassan has ACCEPTED the donation request!\n\nI\'ve shared the following with the patient\'s family:\n• Donor: Omar Hassan\n• Blood Group: O+\n• ETA: ~25 minutes\n• Contact: +20 100 123 4567\n\nI\'ve also opened a direct chat channel between Omar and the hospital coordinator.',
    delayBefore: 1600,
  },
];

/* ─── Pendo Agent IDs ─── */
const AGENT_IDS: Record<Thread['type'], string> = {
  ai: 'rKn5nz0VknLMUHOu-t8ubaDktUg',
  donor: 'MxWuP5MnBKIpy9V3yO763NyTfTc',
  hospital: 'wIEpHpV7jxoGF3SFKW3sX1Axhss',
};

/* ─── Main ChatPage ─── */
export default function ChatPage() {
  const location = useLocation();
  const scriptedState = location.state as { scriptedFlow?: boolean } | null;

  const [threads, setThreads] = useState<Thread[]>(() => {
    // If triggered from AI Contact Donor, clear AI thread messages for scripted replay
    if (scriptedState?.scriptedFlow) {
      return THREADS.map(t =>
        t.id === 1
          ? { ...t, messages: [{ id: 0, role: 'system', content: '🤖 HemoLink AI is ready to coordinate blood donations. AI monitoring is active.', time: fmt(0) }], unread: 0 }
          : t
      );
    }
    return THREADS;
  });
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false); // shows typing animation for user
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptedRan = useRef(false);
  const conversationIds = useRef(new Map<number, string>());
  const getConversationId = (threadId: number) => {
    if (!conversationIds.current.has(threadId)) {
      conversationIds.current.set(threadId, crypto.randomUUID());
    }
    return conversationIds.current.get(threadId)!;
  };
  const isSuggestedPrompt = useRef(false);

  const activeThread = threads.find(t => t.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages.length, aiTyping, userTyping]);

  /* ── Scripted flow: play messages one-by-one with typing indicators ── */
  useEffect(() => {
    if (!scriptedState?.scriptedFlow || scriptedRan.current) return;
    scriptedRan.current = true;

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    SCRIPTED_STEPS.forEach((step, idx) => {
      elapsed += step.delayBefore;

      if (step.role === 'user') {
        // Show user typing indicator first
        timers.push(
          setTimeout(() => setUserTyping(true), elapsed - 1000 < 0 ? 0 : elapsed - 1000)
        );
        timers.push(
          setTimeout(() => {
            setUserTyping(false);
            const msg: Message = {
              id: Date.now() + idx * 10,
              role: 'user',
              content: step.content,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setThreads(prev =>
              prev.map(t => t.id === 1 ? { ...t, messages: [...t.messages, msg], lastMsg: step.content.slice(0, 60) } : t)
            );
          }, elapsed)
        );
      } else {
        // Show AI typing indicator then message
        timers.push(setTimeout(() => setAiTyping(true), elapsed - 800 < 0 ? 0 : elapsed - 800));
        timers.push(
          setTimeout(() => {
            setAiTyping(false);
            const msg: Message = {
              id: Date.now() + idx * 10 + 1,
              role: 'ai',
              content: step.content,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setThreads(prev =>
              prev.map(t => t.id === 1 ? { ...t, messages: [...t.messages, msg], lastMsg: step.content.slice(0, 60) } : t)
            );
          }, elapsed)
        );
      }
    });

    // After all scripted messages, restore the remaining demo thread messages (Omar, CGH, Apollo)
    const totalElapsed = elapsed + 2000;
    timers.push(
      setTimeout(() => {
        setThreads(THREADS); // restore full thread data
      }, totalElapsed)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now(), role: 'user', content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads(prev => prev.map(t =>
      t.id === activeId
        ? { ...t, messages: [...t.messages, userMsg], lastMsg: text, unread: 0 }
        : t
    ));

    pendo.trackAgent("prompt", {
      agentId: AGENT_IDS[activeThread.type],
      conversationId: getConversationId(activeId),
      messageId: crypto.randomUUID(),
      content: text,
      suggestedPrompt: isSuggestedPrompt.current,
    });
    isSuggestedPrompt.current = false;

    // Stream AI reply only in the AI thread
    if (activeThread.type === 'ai') {
      setAiTyping(true);

      const history = activeThread.messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .slice(-10)
        .map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.content }] }));

      history.push({ role: 'user', parts: [{ text: text }] });

      let aiText = '';
      const aiMsgId = Date.now() + 1;

      // Insert placeholder
      const placeholderMsg: Message = {
        id: aiMsgId, role: 'ai', content: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setThreads(prev => prev.map(t =>
        t.id === activeId ? { ...t, messages: [...t.messages, placeholderMsg] } : t
      ));

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(`${supabaseUrl}/functions/v1/llm-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({ contents: history }),
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === '[DONE]') continue;
            try {
              const j = JSON.parse(raw);
              const chunk = j?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunk) {
                aiText += chunk;
                setThreads(prev => prev.map(th =>
                  th.id === activeId
                    ? {
                        ...th,
                        messages: th.messages.map(m =>
                          m.id === aiMsgId ? { ...m, content: aiText } : m
                        ),
                        lastMsg: aiText.slice(0, 60) + (aiText.length > 60 ? '…' : ''),
                      }
                    : th
                ));
              }
            } catch { /* incomplete frame */ }
          }
        }

        if (aiText) {
          pendo.trackAgent("agent_response", {
            agentId: AGENT_IDS.ai,
            conversationId: getConversationId(activeId),
            messageId: crypto.randomUUID(),
            content: aiText,
            modelUsed: "gemini-2.5-flash",
          });
        }
      } catch {
        const fallback = "Connection issue — I'm still monitoring all active blood requests in your region. Please retry.";
        setThreads(prev => prev.map(th =>
          th.id === activeId
            ? { ...th, messages: th.messages.map(m => m.id === aiMsgId ? { ...m, content: fallback } : m) }
            : th
        ));
      } finally {
        setAiTyping(false);
      }
    } else {
      // For non-AI threads, show quick AI auto-response after delay
      setTimeout(() => {
        const autoReply: Message = {
          id: Date.now() + 2,
          role: activeThread.type === 'donor' ? 'donor' : 'hospital',
          content: activeThread.type === 'donor'
            ? '👍 Got your message. I\'ll respond shortly. HemoLink AI is monitoring this conversation.'
            : '✅ Message received by hospital coordinator. AI is processing your request.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setThreads(prev => prev.map(t =>
          t.id === activeId ? { ...t, messages: [...t.messages, autoReply] } : t
        ));
        pendo.trackAgent("agent_response", {
          agentId: AGENT_IDS[activeThread.type],
          conversationId: getConversationId(activeId),
          messageId: crypto.randomUUID(),
          content: autoReply.content,
        });
      }, 1200);
    }
  };

  const handleSelect = (id: number) => {
    setActiveId(id);
    setSidebarOpen(false);
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t));
  };

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="flex h-[calc(100vh-3.5rem-3.5rem)] md:h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        ${sidebarOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} md:relative md:flex
        flex-col w-full md:w-72 shrink-0 border-r bg-card overflow-hidden
      `} style={{ borderColor: 'hsl(var(--border))' }}>
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 md:hidden z-[-1]" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--border))' }}>
          <div>
            <h2 className="font-barlow text-lg font-bold flex items-center gap-2">
              MESSAGES
              {totalUnread > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white bg-primary">{totalUnread}</span>}
            </h2>
            <p className="text-xs text-muted-foreground font-mono-dm">AI-coordinated channels</p>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        {/* AI Status Banner */}
        <div className="mx-3 my-2 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(192,21,42,0.08)', border: '1px solid rgba(192,21,42,0.2)' }}>
          <Zap size={13} className="text-primary shrink-0" />
          <span className="text-xs font-mono-dm text-primary">AI monitoring 4 active channels</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.map(t => (
            <ThreadItem key={t.id} thread={t} active={t.id === activeId} onClick={() => handleSelect(t.id)} />
          ))}
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden">

        {/* Chat header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b bg-card shrink-0" style={{ borderColor: 'hsl(var(--border))' }}>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: activeThread.type === 'ai' ? '#c0152a' : activeThread.type === 'donor' ? '#2a9d8f' : '#2d6a8f' }}>
            {activeThread.type === 'ai' ? '🤖' : activeThread.avatar.slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{activeThread.name}</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground font-mono-dm">
                {activeThread.type === 'ai' ? 'AI Online · Monitoring' : 'Active'}
              </span>
              {activeThread.bloodGroup && (
                <span className="text-xs font-bold font-mono-dm" style={{ color: '#c0152a' }}>{activeThread.bloodGroup}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {activeThread.type !== 'ai' && (
              <a href={`tel:+1`} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-all" title="Call">
                <Phone size={16} className="text-muted-foreground" />
              </a>
            )}
            {activeThread.type === 'ai' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono-dm" style={{ background: 'rgba(192,21,42,0.1)', color: 'hsl(var(--primary))' }}>
                <Activity size={11} className="animate-pulse" /> LIVE AI
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeThread.messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* AI typing indicator */}
          {aiTyping && (
            <div className="flex gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1" style={{ background: '#c0152a' }}>🤖</div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(192,21,42,0.07)', border: '1px solid rgba(192,21,42,0.2)', borderBottomLeftRadius: 4 }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1 font-mono-dm">HemoLink AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          {/* User typing indicator (scripted flow) */}
          {userTyping && (
            <div className="flex gap-2 mb-4 flex-row-reverse">
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(13,10,11,0.85)', borderBottomRightRadius: 4 }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Notification suggestions (AI thread only) */}
        {activeThread.type === 'ai' && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {['Find O+ donors near me', 'Check B- availability in Cairo', 'Post urgent blood request', 'What donors are online?'].map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); isSuggestedPrompt.current = true; inputRef.current?.focus(); }}
                className="text-xs px-2.5 py-1 rounded-full border transition-all hover:border-primary/40 hover:text-primary"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t bg-card shrink-0" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: 'hsl(var(--border))' }}>
            {activeThread.type === 'ai' && <Zap size={15} className="text-primary shrink-0" />}
            <input
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); isSuggestedPrompt.current = false; }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={activeThread.type === 'ai' ? 'Ask HemoLink AI... (e.g. Find O+ donors in Cairo)' : `Message ${activeThread.name}...`}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-primary hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          {activeThread.type === 'ai' && (
            <p className="text-xs text-center text-muted-foreground mt-1.5 font-mono-dm">Powered by Gemini 2.5 Flash · Real-time blood coordination AI</p>
          )}
        </div>
      </div>
    </div>
  );
}
