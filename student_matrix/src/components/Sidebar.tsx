import { Home, Target, Bot, FileText, CreditCard, Award, Settings, Menu, X, WifiOff, Wifi, Lock, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile, useSettings } from '../engine/store';
import { levelFromXp, xpForLevel } from '../engine/adaptive';
import { useOnline } from '../hooks/useOnline';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'quests', label: 'Practice', icon: Target },
  { id: 'learnhub', label: 'My Notes', icon: FileText },
  { id: 'mentor', label: 'Tutor', icon: Bot },
  { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const online = useOnline();
  const p = useProfile();
  const s = useSettings();
  const current = location.pathname.substring(1) || 'dashboard';
  const lvl = levelFromXp(p.xp);
  const into = (p.xp - xpForLevel(lvl)) / Math.max(1, xpForLevel(lvl + 1) - xpForLevel(lvl));

  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); if (!m) setOpen(false); };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const go = (id: string) => { navigate(`/${id}`); setOpen(false); };

  const content = (
    <>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3"><Logo size={40} /><span className="text-xl font-bold text-white">StellarLearn</span></div>
        {isMobile && <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>}
      </div>
      <nav aria-label="Main" className="flex-1 space-y-2">
        {items.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button key={id} onClick={() => go(id)} aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-2xl transition-colors ${active ? 'bg-white text-black' : 'text-white/75 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'}`}>
              <Icon className="w-5 h-5" aria-hidden /><span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-white/20 space-y-3">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white text-sm font-medium truncate">{s.name}</p>
          <p className="text-white/70 text-xs mb-2">Level {lvl} · {p.xp} XP</p>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${Math.round(into * 100)}%` }} /></div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70" role="status">
          {online ? <Wifi className="w-4 h-4" aria-hidden /> : <WifiOff className="w-4 h-4" aria-hidden />}
          <span>{online ? 'Online (not required)' : 'Offline — fully working'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70"><Lock className="w-4 h-4" aria-hidden /><span>Data stays on this device</span></div>
        <button onClick={() => { navigate('/'); setOpen(false); }} className="w-full flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white py-2 border border-white/10 hover:border-white/20 rounded-2xl">
          <ArrowLeft className="w-4 h-4" aria-hidden /> Home
        </button>
      </div>
    </>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-xl">Skip to content</a>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><Logo size={32} /><span className="text-lg font-bold text-white">StellarLearn</span></div>
          <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="p-2 text-white/80 hover:text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      )}
      {!isMobile && <aside className="w-60 h-screen bg-black/80 border-r border-white/10 p-6 flex flex-col sticky top-0 shrink-0">{content}</aside>}
      {isMobile && open && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-black/95 border-r border-white/10 p-6 flex flex-col z-50 overflow-y-auto">{content}</aside>
        </>
      )}
    </>
  );
};
