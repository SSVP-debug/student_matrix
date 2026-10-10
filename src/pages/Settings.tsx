import { useRef, useState } from 'react';
import {
  User,
  Bell,
  Camera,
  Bot,
  Database,
  Eye,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Check,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import {
  exportAll,
  importAll,
  resetAll,
  storageBytes,
  updateSettings,
  useSettings,
} from '../engine/store';
import { isLocalUrl } from '../engine/tutor';
import { canSpeak, speak } from '../engine/speech';

// Sleek white toggle switch matching Screenshot 3
const StellarSwitch = ({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-white/20 ${
      checked ? 'bg-white' : 'bg-[#1e2230]'
    }`}
  >
    <span
      className={`block w-5 h-5 rounded-full transition-transform ${
        checked
          ? 'translate-x-[22px] bg-black shadow-sm'
          : 'translate-x-[2px] bg-[#9ca3af]'
      }`}
    />
  </button>
);

export const Settings = () => {
  const s = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(s.name || 'Zero');
  const [email, setEmail] = useState(s.email || 'zero@stellarlearn.space');
  const [avatarUrl, setAvatarUrl] = useState(s.avatarUrl || '/images/avatar.jpg');
  const [dailyReminders, setDailyReminders] = useState(s.dailyReminders ?? true);
  const [achievementAlerts, setAchievementAlerts] = useState(s.achievementAlerts ?? true);
  const [streakAlerts, setStreakAlerts] = useState(s.streakAlerts ?? true);
  const [missionAlerts, setMissionAlerts] = useState(s.missionAlerts ?? true);

  const [geminiKey, setGeminiKey] = useState(s.geminiApiKey || '');
  const [groqKey, setGroqKey] = useState(s.groqApiKey || '');
  const [ollamaUrl, setOllamaUrl] = useState(s.localLlmUrl || '');
  const [aiProvider, setAiProvider] = useState(s.aiProvider || 'gemini');

  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const kb = (storageBytes() / 1024).toFixed(1);

  const handleSave = () => {
    updateSettings({
      name: name.trim() || 'Zero',
      email: email.trim() || 'zero@stellarlearn.space',
      avatarUrl,
      dailyReminders,
      achievementAlerts,
      streakAlerts,
      missionAlerts,
      geminiApiKey: geminiKey.trim(),
      groqApiKey: groqKey.trim(),
      localLlmUrl: ollamaUrl.trim(),
      aiProvider: aiProvider as any,
    });
    setSavedSuccess(true);
    setMsg({ text: 'Changes saved successfully!', type: 'success' });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAvatarUpload = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        updateSettings({ avatarUrl: result });
      }
    };
    reader.readAsDataURL(f);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportAll()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellarlearn-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ text: 'Backup downloaded successfully.', type: 'success' });
  };

  const upload = async (f?: File) => {
    if (!f) return;
    try {
      importAll(await f.text());
      setMsg({ text: 'Backup restored successfully.', type: 'success' });
    } catch (e) {
      setMsg({ text: `Could not restore: ${(e as Error).message}`, type: 'error' });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const llmBad = ollamaUrl !== '' && !isLocalUrl(ollamaUrl);

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      <Sidebar />

      <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 max-w-[1200px] mx-auto w-full space-y-7">
        {/* Header (Screenshot 3) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-[#9ca3af]">
              Customize Your Learning Experience
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#171a24] border border-[#232736] text-white hover:bg-[#202534] hover:border-white/30 font-semibold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-md"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </header>

        {/* Feedback Message */}
        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Card 1: Profile (Screenshot 3) */}
          <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#141620] border border-[#202534] flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Profile</h2>
                <p className="text-xs text-[#9ca3af]">Manage your account information</p>
              </div>
            </div>

            {/* Profile Picture Row */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#202534] bg-[#141620]">
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/Pixie.webp';
                    }}
                  />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Upload profile picture"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-slate-200 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-black" />
                </button>
              </div>

              <div>
                <p className="text-sm font-bold text-white">Profile Picture</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">Upload a photo from your device</p>
              </div>
            </div>

            {/* Display Name & Email 2-Column Inputs */}
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="display-name" className="block text-xs font-semibold text-[#9ca3af] mb-2">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2f364b]"
                  placeholder="Zero"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#9ca3af] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2f364b]"
                  placeholder="zero@stellarlearn.space"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Notifications (Screenshot 3) */}
          <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#141620] border border-[#202534] flex items-center justify-center text-white shrink-0">
                <Bell className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Notifications</h2>
                <p className="text-xs text-[#9ca3af]">Configure your alerts and reminders</p>
              </div>
            </div>

            {/* 4 Notification Toggles */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-white">Daily Reminders</span>
                <StellarSwitch
                  checked={dailyReminders}
                  onChange={setDailyReminders}
                  ariaLabel="Daily Reminders toggle"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-white">Achievement Unlocked</span>
                <StellarSwitch
                  checked={achievementAlerts}
                  onChange={setAchievementAlerts}
                  ariaLabel="Achievement Unlocked toggle"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-white">Streak Alerts</span>
                <StellarSwitch
                  checked={streakAlerts}
                  onChange={setStreakAlerts}
                  ariaLabel="Streak Alerts toggle"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-white">Mission Updates</span>
                <StellarSwitch
                  checked={missionAlerts}
                  onChange={setMissionAlerts}
                  ariaLabel="Mission Updates toggle"
                />
              </div>
            </div>
          </div>

          {/* Card 3: AI Intelligence Engine */}
          <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#141620] border border-[#202534] flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">AI Intelligence Engine</h2>
                  <p className="text-xs text-[#9ca3af]">Connected to Google Gemini & Groq</p>
                </div>
              </div>

              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Online & Ready
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label htmlFor="ai-provider" className="block text-xs font-semibold text-white mb-1.5">
                  Primary AI Intelligence Provider
                </label>
                <select
                  id="ai-provider"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as any)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="gemini">Google Gemini (Gemini 2.5 Flash — Ultra Fast)</option>
                  <option value="groq">Groq (LLaMA 3.3 70B Versatile)</option>
                  <option value="local">Ollama / Local (Private Network)</option>
                  <option value="auto">Auto Selection</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="gemini-key" className="text-xs font-semibold text-white">
                    Google Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Get Free Gemini Key ↗
                  </a>
                </div>
                <input
                  id="gemini-key"
                  type="password"
                  placeholder="AQ... or AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="groq-key" className="text-xs font-semibold text-white">
                    Groq API Key (Optional)
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Get Groq Key ↗
                  </a>
                </div>
                <input
                  id="groq-key"
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label htmlFor="ollama" className="block text-xs font-semibold text-[#9ca3af] mb-1.5">
                  Local Ollama URL (Offline Fallback)
                </label>
                <input
                  id="ollama"
                  type="text"
                  placeholder="http://localhost:11434"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-400"
                />
                {llmBad && (
                  <p className="text-rose-400 text-xs mt-1">
                    Only localhost or private network IPs are allowed for security.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Accessibility & Learning Preferences */}
          <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#141620] border border-[#202534] flex items-center justify-center text-white shrink-0">
                <Eye className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Accessibility & Voice</h2>
                <p className="text-xs text-[#9ca3af]">Adjust font scaling, speech, and contrast</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[#9ca3af]">Text Scaling</span>
                  <span className="text-xs font-bold text-white">{Math.round(s.textScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.9}
                  max={1.4}
                  step={0.05}
                  value={s.textScale}
                  onChange={(e) => updateSettings({ textScale: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-sm font-medium text-white block">Dyslexia-friendly Typography</span>
                  <span className="text-xs text-[#64748b]">Wider letter spacing for improved readability</span>
                </div>
                <StellarSwitch
                  checked={s.dyslexiaFont}
                  onChange={(v) => updateSettings({ dyslexiaFont: v })}
                  ariaLabel="Dyslexia Font"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-sm font-medium text-white block">Read Questions & Answers Aloud</span>
                  <span className="text-xs text-[#64748b]">Uses browser text-to-speech engine</span>
                </div>
                <StellarSwitch
                  checked={s.speak && canSpeak()}
                  onChange={(v) => updateSettings({ speak: v })}
                  ariaLabel="Speech synthesis"
                />
              </div>

              {canSpeak() && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af]">Speech Velocity: {s.speechRate.toFixed(1)}×</span>
                  <button
                    onClick={() => speak('Voice synthesis operational.', s.speechRate)}
                    className="px-3 py-1.5 rounded-lg bg-[#171a24] text-xs text-white hover:bg-[#202534] flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Voice</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Data Ownership & Storage */}
          <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#141620] border border-[#202534] flex items-center justify-center text-white shrink-0">
                <Database className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Data Management & Offline Storage</h2>
                <p className="text-xs text-[#9ca3af]">Local footprint: {kb} KB · Zero tracking pixels</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={download}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup</span>
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => upload(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[#171a24] border border-[#232736] text-white hover:bg-[#202534] font-semibold text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all progress and study data?')) {
                    resetAll();
                    setMsg({ text: 'All data has been reset to defaults.', type: 'success' });
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
