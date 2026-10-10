import { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Page, Card, btnPrimary, btnGhost } from '../components/Page';
import { exportAll, importAll, resetAll, storageBytes, updateSettings, useSettings } from '../engine/store';
import { isLocalUrl } from '../engine/tutor';
import { canSpeak, speak } from '../engine/speech';

const Toggle = ({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start justify-between gap-4 py-3 border-b border-white/10 last:border-0 cursor-pointer">
    <span><span className="block font-medium">{label}</span>{hint && <span className="block text-sm text-white/70">{hint}</span>}</span>
    <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-6 h-6 mt-1 accent-cyan-300 shrink-0" />
  </label>
);

export const Settings = () => {
  const s = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const kb = (storageBytes() / 1024).toFixed(1);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportAll()], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `student_matrix-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const upload = async (f?: File) => {
    if (!f) return;
    try { importAll(await f.text()); setMsg('Backup restored.'); } catch (e) { setMsg(`Could not restore: ${(e as Error).message}`); }
    if (fileRef.current) fileRef.current.value = '';
  };
  const llmBad = s.localLlmUrl !== '' && !isLocalUrl(s.localLlmUrl);

  return (
    <Page title="Settings" subtitle="Accessibility, performance and privacy controls.">
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-xl font-semibold tracking-tight mb-3">Profile & goals</h2>
          <label htmlFor="name" className="block text-sm text-white/70 mb-1">Your name</label>
          <input id="name" value={s.name} maxLength={30} onChange={(e) => updateSettings({ name: e.target.value })} className="w-full rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-3 mb-4" />
          <label htmlFor="goal" className="block text-sm text-white/70 mb-1">Daily goal: {s.dailyGoal} questions</label>
          <input id="goal" type="range" min={3} max={40} value={s.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })} className="w-full accent-cyan-300" />
        </Card>

        <Card>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Accessibility</h2>
          <label htmlFor="scale" className="block text-sm text-white/70 mt-2 mb-1">Text size: {Math.round(s.textScale * 100)}%</label>
          <input id="scale" type="range" min={0.9} max={1.5} step={0.05} value={s.textScale} onChange={(e) => updateSettings({ textScale: Number(e.target.value) })} className="w-full accent-cyan-300 mb-2" />
          <Toggle label="Dyslexia-friendly text" hint="Wider spacing and a clear, high-legibility font" checked={s.dyslexiaFont} onChange={(v) => updateSettings({ dyslexiaFont: v })} />
          <Toggle label="High contrast" checked={s.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
          <Toggle label="Reduce motion" checked={s.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} />
          <Toggle label="Read questions and answers aloud" hint={canSpeak() ? 'Uses your device’s built-in voice — works offline' : 'Not supported by this browser'} checked={s.speak && canSpeak()} onChange={(v) => updateSettings({ speak: v })} />
          {canSpeak() && <div className="mt-2"><label htmlFor="rate" className="block text-sm text-white/70 mb-1">Speech speed: {s.speechRate.toFixed(1)}×</label>
            <input id="rate" type="range" min={0.6} max={1.6} step={0.1} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="w-full accent-cyan-300" />
            <button className={`${btnGhost} mt-2`} onClick={() => speak('This is how I will sound.', s.speechRate)}>Test voice</button></div>}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Performance</h2>
          <Toggle label="Lite mode (low-resource devices)" hint="Turns off blur effects, animations and decorative graphics to save battery and memory. Enabled automatically on low-memory devices." checked={s.liteMode} onChange={(v) => updateSettings({ liteMode: v })} />
          <p className="text-sm text-white/70 mt-3">The app works fully offline after the first load and uses about {kb} KB of local storage for your progress.</p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Optional local AI model</h2>
          <p className="text-sm text-white/70 mb-3">The tutor already works without any model. If you run an Ollama server on this computer or your home network, the tutor can use it for fuller answers. Only localhost / private-network addresses are accepted, so your questions never go to the internet.</p>
          <label htmlFor="llm" className="block text-sm text-white/70 mb-1">Server address</label>
          <input id="llm" placeholder="http://localhost:11434" value={s.localLlmUrl} onChange={(e) => updateSettings({ localLlmUrl: e.target.value.trim() })} className="w-full rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-3 mb-1" aria-invalid={llmBad} />
          {llmBad && <p className="text-rose-300 text-sm mb-2" role="alert">Only localhost or private-network addresses are allowed.</p>}
          <label htmlFor="model" className="block text-sm text-white/70 mt-2 mb-1">Model name</label>
          <input id="model" value={s.localLlmModel} onChange={(e) => updateSettings({ localLlmModel: e.target.value.trim() })} className="w-full rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-3" />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold tracking-tight mb-1">Your data</h2>
          <p className="text-sm text-white/70 mb-4">All progress, notes and settings are stored only in this browser. There is no account and no server. Export a backup to move to another device.</p>
          <div className="flex flex-wrap gap-3">
            <button className={btnPrimary} onClick={download}><Download className="inline w-4 h-4 mr-1" aria-hidden />Export backup</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <button className={btnGhost} onClick={() => fileRef.current?.click()}><Upload className="inline w-4 h-4 mr-1" aria-hidden />Restore backup</button>
            <button className={`${btnGhost} text-rose-300 border-rose-300/40`} onClick={() => { if (confirm('Delete all progress, notes and settings from this device? This cannot be undone.')) { resetAll(); setMsg('All data deleted.'); } }}><Trash2 className="inline w-4 h-4 mr-1" aria-hidden />Delete all data</button>
          </div>
          {msg && <p role="status" className="text-sm mt-3">{msg}</p>}
        </Card>
      </div>
    </Page>
  );
};
