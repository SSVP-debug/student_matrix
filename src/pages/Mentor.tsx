import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  Zap,
  Atom,
  Target,
  FileText,
  HelpCircle,
  Key,
  X,
  Volume2,
  Square,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Md } from '../components/Md';
import { useProfile, useSettings, updateSettings } from '../engine/store';
import { useStaticData } from '../engine/bank';
import { answer, buildIndex, type TutorReply } from '../engine/tutor';
import { speak, stopSpeaking, canSpeak } from '../engine/speech';

interface Msg {
  role: 'user' | 'tutor';
  text: string;
  reply?: TutorReply;
  time: string;
}

const INITIAL_MESSAGE: Msg = {
  role: 'tutor',
  text: "Hello! I'm Pixie, your AI Learning Assistant. I'm here to help you explore the universe of knowledge. What would you like to learn today?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const Mentor = () => {
  const p = useProfile();
  const s = useSettings();
  const { data } = useStaticData();

  const index = useMemo(
    () => (data ? buildIndex(data, p) : null),
    // eslint-disable-line react-hooks/exhaustive-deps
    [data, p.notes]
  );

  const [msgs, setMsgs] = useState<Msg[]>([INITIAL_MESSAGE]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(s.geminiApiKey || '');

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  useEffect(() => stopSpeaking, []);

  const ask = async (text: string) => {
    const query = text.trim();
    if (!query || busy) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMsgs((prev) => [...prev, { role: 'user', text: query, time }]);
    setQ('');
    setBusy(true);

    try {
      if (index && data) {
        const r = await answer(query, index, data, p, s);
        setMsgs((prev) => [
          ...prev,
          {
            role: 'tutor',
            text: r.markdown,
            reply: r,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (s.speak) speak(r.markdown, s.speechRate);
      }
    } catch (e) {
      setMsgs((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: `I ran into an issue processing your request: ${(e as Error).message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSaveKey = () => {
    updateSettings({ geminiApiKey: apiKeyInput.trim(), aiProvider: 'gemini' });
    setShowKeyModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      <Sidebar />

      <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 flex flex-col max-w-[1600px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Column: Chat Conversation Container */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0c0d12] border border-[#171a24] rounded-3xl p-5 md:p-6 shadow-2xl relative">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {msgs.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#1e2230] text-white rounded-tr-none'
                          : 'bg-[#181a22] text-[#f1f5f9] rounded-tl-none border border-[#222636]'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div>
                          <Md text={m.text} />
                          {canSpeak() && (
                            <button
                              type="button"
                              onClick={() => speak(m.text, s.speechRate)}
                              className="mt-3 text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 pt-2 border-t border-white/5"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          )}
                        </div>
                      )}
                      <span className="block text-[11px] text-[#64748b] mt-2 text-right">{m.time}</span>
                    </div>
                  </div>
                );
              })}

              {busy && (
                <div className="flex justify-start">
                  <div className="bg-[#181a22] border border-[#222636] rounded-2xl rounded-tl-none p-4 text-sm text-[#94a3b8] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Pixie is thinking…</span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick Suggestion Pills (Screenshot 5: 2x2 grid) */}
            <div className="pt-4 border-t border-[#1a1d28] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { icon: BookOpen, text: 'Explain quantum physics basics' },
                  { icon: Zap, text: 'Help with math problem' },
                  { icon: Atom, text: 'Create study plan' },
                  { icon: Target, text: 'Quiz me on biology' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => ask(item.text)}
                      className="bg-[#14161f] border border-[#212534] hover:bg-[#1a1d29] hover:border-[#2f354a] text-[#cbd5e1] text-xs py-3 px-4 rounded-xl flex items-center gap-3 transition-colors text-left font-medium"
                    >
                      <Icon className="w-4 h-4 text-[#94a3b8] shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Message Composer (Screenshot 5) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(q);
                }}
                className="flex items-center gap-3 bg-[#13151c] border border-[#232736] rounded-2xl px-4 py-2.5 shadow-inner"
              >
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  disabled={busy}
                  placeholder="Ask me anything about learning..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#64748b] focus:outline-none"
                />

                {canSpeak() && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="p-1.5 text-[#64748b] hover:text-white"
                    title="Stop reading"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={busy || !q.trim()}
                  className="w-9 h-9 rounded-xl bg-[#202534] hover:bg-white hover:text-black text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-[#202534] disabled:hover:text-white"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Assistant Profile & Capabilities Cards (Screenshot 5) */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-4">
            {/* Card 1: Pixie Avatar & Status */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 text-center space-y-3 shadow-xl">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="/images/Pixie.webp"
                  alt="Pixie"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Pixie</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">Your AI Learning Assistant</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141722] border border-[#222736] text-xs text-[#cbd5e1]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online & Ready</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="text-[11px] text-[#38bdf8] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Key className="w-3 h-3" />
                  <span>Configure Gemini Key</span>
                </button>
              </div>
            </div>

            {/* Card 2: Learning Capabilities */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-white tracking-tight">Learning Capabilities</h4>

              <div className="space-y-3.5">
                {[
                  {
                    icon: Sparkles,
                    title: 'Explain Concepts',
                    desc: 'Break down complex topics clearly',
                  },
                  {
                    icon: FileText,
                    title: 'Study Resources',
                    desc: 'Create notes & learning materials',
                  },
                  {
                    icon: Target,
                    title: 'Practice & Quizzes',
                    desc: 'Generate exercises and tests',
                  },
                  {
                    icon: HelpCircle,
                    title: 'Personalized Help',
                    desc: 'Adapts to your learning needs',
                  },
                ].map((cap, idx) => {
                  const Icon = cap.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#151822] border border-[#222736] flex items-center justify-center text-[#94a3b8] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white leading-tight">{cap.title}</p>
                        <p className="text-[11px] text-[#94a3b8] leading-tight mt-0.5">{cap.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Pro Tips */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 space-y-3 shadow-xl">
              <h4 className="text-sm font-bold text-white tracking-tight">Pro Tips</h4>
              <ul className="space-y-2 text-xs text-[#94a3b8]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                  <span>Be specific with your questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                  <span>Ask for examples when confused</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                  <span>Request practice problems</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                  <span>Ask for different explanations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-[#202534] max-w-md w-full p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#202534]">
              <h3 className="font-bold text-white text-base">Gemini API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#94a3b8]">
              Your key is saved locally in browser storage for open-ended queries.
            </p>
            <input
              type="password"
              placeholder="AQ... or AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-[#151822] border border-[#262c3e] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs text-[#94a3b8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-100"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
