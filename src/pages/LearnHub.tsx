import { useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Video,
  Sparkles,
  HelpCircle,
  Bot,
  Loader2,
  Trash2,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { updateProfile, useProfile } from '../engine/store';
import { buildNote, extractText } from '../engine/notes';
import type { Note } from '../engine/types';

export const LearnHub = () => {
  const navigate = useNavigate();
  const p = useProfile();

  const [activeTab, setActiveTab] = useState<'upload' | 'notes' | 'questions' | 'mentor'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [ytStatus, setYtStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Manual paste state
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSave = (text: string, title: string) => {
    if (text.trim().length < 200) {
      setMsg({
        text: 'Document must contain at least 200 characters of text to generate notes and questions.',
        type: 'error',
      });
      return;
    }
    const note = buildNote(title || 'Uploaded Document', text);
    updateProfile((prev) => ({ ...prev, notes: [note, ...prev.notes].slice(0, 30) }));
    setPasteTitle('');
    setPasteText('');
    setOpenNoteId(note.id);
    setMsg({
      text: `Successfully processed "${note.title}": ${note.summary.length} key notes, ${note.questions.length} questions, and ${note.cards.length} flashcards generated!`,
      type: 'success',
    });
    setActiveTab('notes');
  };

  const onFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error('File exceeds 15 MB limit.');
      const extracted = await extractText(file);
      processAndSave(extracted, file.name.replace(/\.[^.]+$/, ''));
    } catch (e) {
      setMsg({ text: `Could not process file: ${(e as Error).message}`, type: 'error' });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcessYoutube = () => {
    if (!youtubeUrl.trim()) return;
    setYtStatus('Validating YouTube video transcript…');
    setTimeout(() => {
      // In local browser mode, advise user to paste notes or transcript
      setYtStatus(
        'For full offline security, please copy the video transcript or key summary into the text input below to generate study material.'
      );
    }, 800);
  };

  const removeNote = (n: Note) => {
    if (confirm(`Delete "${n.title}" and its generated materials?`)) {
      updateProfile((prev) => ({ ...prev, notes: prev.notes.filter((x) => x.id !== n.id) }));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      <Sidebar />

      <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 max-w-[1400px] mx-auto w-full space-y-7">
        {/* Header (Screenshot 4) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              LearnHub
            </h1>
            <p className="text-sm text-[#9ca3af]">
              Upload content and generate smart study materials
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c0d12] border border-[#1e2230] text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Powered</span>
          </div>
        </header>

        {/* Tab Segmented Control (Screenshot 4) */}
        <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'notes', label: `Notes (${p.notes.length})`, icon: FileText },
            { id: 'questions', label: 'Questions', icon: HelpCircle },
            { id: 'mentor', label: 'AI Mentor', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'mentor') navigate('/mentor');
                  else setActiveTab(tab.id as any);
                }}
                className={`py-2 px-6 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#1c202d] text-white shadow-md'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Tab 1: Upload View (Screenshot 4: 2 side-by-side cards) */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1: Upload PDF */}
              <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-white" />
                  <h2 className="text-base font-bold text-white tracking-tight">Upload PDF</h2>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e: DragEvent) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files.length) onFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center space-y-3 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-[#202534] bg-[#0c0e14] hover:border-[#2f364b] hover:bg-[#10121a]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={(e) => onFileUpload(e.target.files?.[0])}
                  />

                  <div className="w-10 h-10 rounded-full bg-[#161822] flex items-center justify-center mx-auto text-white">
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">
                      {busy ? 'Extracting & Generating…' : 'Upload PDF Document'}
                    </p>
                    <p className="text-xs text-[#9ca3af]">Click to browse or drag & drop</p>
                    <p className="text-[11px] text-[#64748b] pt-1">Supports .pdf files</p>
                  </div>
                </div>
              </div>

              {/* Card 2: YouTube Video */}
              <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Video className="w-5 h-5 text-white" />
                    <h2 className="text-base font-bold text-white tracking-tight">YouTube Video</h2>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="Paste YouTube video URL here..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2f364b]"
                    />

                    <button
                      onClick={handleProcessYoutube}
                      className="w-full py-3.5 rounded-xl bg-[#171a24] border border-[#222736] text-[#9ca3af] hover:text-white hover:bg-[#202534] font-semibold text-xs transition-all"
                    >
                      Process Video
                    </button>
                  </div>

                  {ytStatus && (
                    <p className="text-xs text-[#9ca3af] leading-relaxed p-3 rounded-xl bg-[#141722] border border-[#222736]">
                      {ytStatus}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-[#64748b]">
                  Generates summaries and flashcards from educational video transcripts.
                </p>
              </div>
            </div>

            {/* Paste Lecture Notes Drawer / Section */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 space-y-3.5">
              <h3 className="text-sm font-bold text-white tracking-tight">Or Paste Text Notes Directly</h3>
              <input
                placeholder="Topic Title (e.g. Cellular Respiration)"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2f364b]"
              />
              <textarea
                rows={5}
                placeholder="Paste book passages, lecture notes, or study guides (200+ characters)…"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full bg-[#12141c] border border-[#1e2230] rounded-xl p-3 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2f364b] resize-y"
              />
              <button
                disabled={pasteText.trim().length < 200}
                onClick={() => processAndSave(pasteText, pasteTitle)}
                className="py-3 px-6 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white"
              >
                Generate Study Material from Text
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Notes List */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Processed Note Summaries ({p.notes.length})
            </h2>

            {p.notes.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#0c0d12] border border-[#171a24] text-center space-y-2">
                <FileText className="w-8 h-8 text-[#64748b] mx-auto" />
                <p className="text-sm font-bold text-white">No custom notes yet</p>
                <p className="text-xs text-[#9ca3af]">
                  Upload a PDF in the Upload tab above to generate smart summaries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {p.notes.map((n) => {
                  const isOpen = openNoteId === n.id;
                  return (
                    <div
                      key={n.id}
                      className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <button
                          onClick={() => setOpenNoteId(isOpen ? null : n.id)}
                          className="text-left flex-1 space-y-1"
                        >
                          <h3 className="font-bold text-white text-base leading-tight hover:text-cyan-400 transition-colors">
                            {n.title}
                          </h3>
                          <p className="text-xs text-[#9ca3af]">
                            {n.summary.length} points · {n.questions.length} questions · {n.cards.length} cards ·{' '}
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/quests?topic=${encodeURIComponent(`My notes: ${n.title}`)}`)
                            }
                            className="p-2 rounded-xl bg-[#181a24] text-white hover:bg-white hover:text-black text-xs font-semibold"
                            title="Practice questions"
                          >
                            <Target className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeNote(n)}
                            className="p-2 rounded-xl bg-[#181a24] text-rose-400 hover:bg-rose-500/20 text-xs"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOpenNoteId(isOpen ? null : n.id)}
                            className="p-2 text-[#9ca3af]"
                          >
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="pt-3 border-t border-[#1a1d28] space-y-3 text-xs leading-relaxed animate-fade-in">
                          <div>
                            <p className="font-bold text-white uppercase tracking-wider mb-1.5">
                              Summary Points:
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-[#cbd5e1]">
                              {n.summary.map((pt, idx) => (
                                <li key={idx}>{pt}</li>
                              ))}
                            </ul>
                          </div>

                          {n.keyTerms.length > 0 && (
                            <div>
                              <p className="font-bold text-white uppercase tracking-wider mb-1.5">
                                Key Terms:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {n.keyTerms.map((term, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-[#161822] border border-[#202534] text-white text-[11px]"
                                  >
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Generated Questions */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight">Generated Practice Sets</h2>
            {p.notes.flatMap((n) => n.questions).length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0c0d12] border border-[#171a24] text-center text-xs text-[#9ca3af]">
                No generated questions yet. Process a PDF to generate adaptive quiz questions.
              </div>
            ) : (
              <div className="space-y-3">
                {p.notes.map((n) => (
                  <div key={n.id} className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{n.title}</h4>
                      <p className="text-xs text-[#9ca3af]">{n.questions.length} questions available</p>
                    </div>
                    <button
                      onClick={() => navigate(`/quests?topic=${encodeURIComponent(`My notes: ${n.title}`)}`)}
                      className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-100"
                    >
                      Launch Quest
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
