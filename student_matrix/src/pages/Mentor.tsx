import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Volume2, Square, Loader2 } from 'lucide-react';
import { Page, Card, btnPrimary, btnGhost } from '../components/Page';
import { Md } from '../components/Md';
import { updateSettings, useProfile, useSettings } from '../engine/store';
import { useStaticData } from '../engine/bank';
import { answer, buildIndex, type TutorReply } from '../engine/tutor';
import { speak, stopSpeaking, canSpeak } from '../engine/speech';
import type { Settings } from '../engine/types';

interface Msg { role: 'user' | 'tutor'; text: string; reply?: TutorReply }

const SUGGESTIONS = ["What is Newton's first law?", 'Explain kinetic energy', 'What is a quadratic equation?', 'What is polymorphism?'];

export const Mentor = () => {
  const nav = useNavigate();
  const p = useProfile();
  const s = useSettings();
  const { data, error } = useStaticData();
  const index = useMemo(() => (data ? buildIndex(data, p) : null), [data, p.notes]); // eslint-disable-line react-hooks/exhaustive-deps
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'tutor', text: "Hi, I'm Pixie, your on-device tutor. Ask me about anything in your course material or your own notes. I work offline, and I adjust how I explain based on how well you know the topic." }]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);
  useEffect(() => stopSpeaking, []);

  const ask = async (text: string) => {
    const query = text.trim();
    if (!query || !index || !data || busy) return;
    setMsgs((m) => [...m, { role: 'user', text: query }]); setQ(''); setBusy(true);
    try {
      const r = await answer(query, index, data, p, s);
      setMsgs((m) => [...m, { role: 'tutor', text: r.markdown, reply: r }]);
      if (s.speak) speak(r.markdown, s.speechRate);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMsgs((m) => [...m, { role: 'tutor', text: `The AI tutor could not respond: ${message}. Check the Gemini setup in Settings or try again.` }]);
    } finally { setBusy(false); }
  };

  if (error) return <Page title="Tutor"><Card>Could not load course data: {error}</Card></Page>;

  return (
    <Page title="Tutor" subtitle={s.geminiEnabled ? 'Gemini can provide fuller answers; questions and relevant material are sent to Google.' : 'Answers come from material stored on your device, explained at your level.'}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label htmlFor="lvl" className="text-sm text-white/70">Explanation level</label>
        <select id="lvl" value={s.tutorLevel} onChange={(e) => updateSettings({ tutorLevel: e.target.value as Settings['tutorLevel'] })} className="rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-2">
          <option value="auto">Auto (matches my mastery)</option><option value="simple">Simple</option><option value="standard">Standard</option><option value="deep">Deep</option>
        </select>
      </div>
      <Card className="max-w-3xl flex flex-col" >
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div className={`inline-block max-w-full text-left rounded-2xl p-4 ${m.role === 'user' ? 'bg-white text-black' : 'glass border border-white/10'}`}>
                {m.role === 'user' ? m.text : <Md text={m.text} />}
                {m.reply && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {canSpeak() && <button className={btnGhost} aria-label="Read aloud" onClick={() => speak(m.text, s.speechRate)}><Volume2 className="w-4 h-4" /></button>}
                    {m.reply.practice && <button className={btnGhost} onClick={() => nav(`/quests?topic=${encodeURIComponent(m.reply!.practice!.topic)}`)}>Practise this topic</button>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <p className="text-white/70 text-sm"><Loader2 className="inline w-4 h-4 animate-spin mr-1" aria-hidden />Thinking…</p>}
          <div ref={end} />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {SUGGESTIONS.map((x) => <button key={x} className={`${btnGhost} text-sm`} onClick={() => ask(x)}>{x}</button>)}
        </div>
        <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
          <label htmlFor="q" className="sr-only">Your question</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} disabled={!index} placeholder={index ? 'Ask a question…' : 'Loading course material…'} className="flex-1 rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-3" />
          <button type="submit" className={btnPrimary} disabled={busy || !q.trim()} aria-label="Send"><Send className="w-4 h-4" /></button>
          <button type="button" className={btnGhost} aria-label="Stop reading" onClick={stopSpeaking}><Square className="w-4 h-4" /></button>
        </form>
      </Card>
    </Page>
  );
};
