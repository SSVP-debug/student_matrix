import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  FlaskConical,
  Compass,
  Laptop,
  Coffee,
  Code2,
  Sparkles,
  Plus,
  Volume2,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useProfile, useSettings } from '../engine/store';
import { useStaticData } from '../engine/bank';
import { sm2, newCard } from '../engine/adaptive';
import { updateProfile } from '../engine/store';
import { speak } from '../engine/speech';

interface SubjectInfo {
  name: string;
  icon: any;
  iconColor?: string;
}

const DEFAULT_SUBJECTS: SubjectInfo[] = [
  { name: 'Physics', icon: Zap, iconColor: 'text-amber-500' },
  { name: 'Chemistry', icon: FlaskConical, iconColor: 'text-emerald-400' },
  { name: 'Mathematics', icon: Compass, iconColor: 'text-blue-400' },
  { name: 'C++', icon: Laptop, iconColor: 'text-cyan-400' },
  { name: 'Java', icon: Coffee, iconColor: 'text-purple-400' },
  { name: 'Python', icon: Code2, iconColor: 'text-emerald-400' },
];

export const Flashcards = () => {
  const navigate = useNavigate();
  const p = useProfile();
  const s = useSettings();
  const { data } = useStaticData();

  const [activeSubject, setActiveSubject] = useState('Physics');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Pool cards for active subject
  const subjectCards = useMemo(() => {
    if (!data) return [];
    const fromBuiltin = data.subjects
      .filter((sub) => sub.name.toLowerCase() === activeSubject.toLowerCase())
      .flatMap((sub) =>
        sub.cards.map((c) => ({
          id: `s${sub.id}-${c.id}`,
          subject: sub.name,
          question: c.question,
          answer: c.answer,
        }))
      );

    const fromNotes = p.notes
      .flatMap((n) => n.cards)
      .filter((c) => c.subject.toLowerCase() === activeSubject.toLowerCase());

    const total = [...fromBuiltin, ...fromNotes];
    if (total.length === 0) {
      // Fallback sample cards for demonstration if subject has no cards
      return [
        {
          id: 'sample-1',
          subject: activeSubject,
          question: `What is Newton's First Law of Motion?`,
          answer: `An object at rest remains at rest, and an object in motion remains in motion at constant velocity unless acted upon by a net external force.`,
        },
        {
          id: 'sample-2',
          subject: activeSubject,
          question: `Define kinetic energy and state its formula.`,
          answer: `Kinetic energy is the energy possessed by an object due to its motion. Formula: KE = 0.5 * m * v^2`,
        },
      ];
    }
    return total;
  }, [data, p.notes, activeSubject]);

  const curCard = subjectCards[currentCardIdx] || subjectCards[0];
  const totalCards = subjectCards.length || 15;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev + 1) % Math.max(1, subjectCards.length));
  };

  const handleGrade = (g: 1 | 3 | 4 | 5) => {
    if (curCard) {
      updateProfile((pp) => ({
        ...pp,
        cards: { ...pp.cards, [curCard.id]: sm2(pp.cards[curCard.id] ?? newCard(), g) },
        cardsReviewed: pp.cardsReviewed + 1,
        xp: pp.xp + 2,
      }));
    }
    handleNext();
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      <Sidebar />

      <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 max-w-[1400px] mx-auto w-full space-y-7">
        {/* Header (Screenshot 2) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Flashcards
            </h1>
            <p className="text-sm text-[#9ca3af]">
              Master Concepts Through Active Recall
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/learnhub')}
              className="px-4 py-2.5 rounded-xl bg-[#0c0d12] border border-[#1e2230] text-white text-xs font-semibold hover:border-white/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Set</span>
            </button>
            <button
              onClick={() => navigate('/learnhub')}
              className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>AI Generate</span>
            </button>
          </div>
        </header>

        {/* Choose Subject Carousel / Grid (Screenshot 2) */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white tracking-tight">Choose Subject</h2>
          <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
            {DEFAULT_SUBJECTS.map((sub) => {
              const Icon = sub.icon;
              const isSelected = activeSubject.toLowerCase() === sub.name.toLowerCase();

              return (
                <button
                  key={sub.name}
                  onClick={() => {
                    setActiveSubject(sub.name);
                    setCurrentCardIdx(0);
                    setIsFlipped(false);
                  }}
                  className={`min-w-[125px] sm:min-w-[135px] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-white text-black shadow-xl scale-[1.02]'
                      : 'bg-[#0c0d12] text-white border border-[#171a24] hover:border-[#272c3d]'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isSelected ? 'text-amber-500' : sub.iconColor || 'text-[#9ca3af]'
                    }`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-tight">{sub.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-black/60' : 'text-[#6b7280]'}`}>
                      15 cards
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main 2-Column Assessment Workspace (Screenshot 2) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Flashcard Flip Card */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {activeSubject} Flashcards
              </h3>
              <span className="text-xs text-[#9ca3af] font-medium">
                Card {currentCardIdx + 1} of {totalCards}
              </span>
            </div>

            {/* Interactive Flashcard Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-[#12141d] border border-[#1d212f] hover:border-[#2c3246] rounded-3xl p-8 sm:p-12 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center space-y-4 cursor-pointer select-none transition-all shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-full bg-[#1b1e2a] flex items-center justify-center text-amber-500 shadow-sm">
                <Zap className="w-5 h-5 fill-amber-500" />
              </div>

              <div className="space-y-2 max-w-lg">
                <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  {isFlipped ? 'Answer' : 'Question'}
                </p>
                <h4 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                  {isFlipped ? curCard?.answer : curCard?.question}
                </h4>
              </div>

              <p className="text-xs text-[#64748b] pt-4">
                {isFlipped ? 'Click to flip back to question' : 'Click to reveal answer'}
              </p>

              {/* Speak Audio Button */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(isFlipped ? curCard?.answer : curCard?.question, s.speechRate);
                  }}
                  className="p-2 text-[#64748b] hover:text-white rounded-lg hover:bg-white/5"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* If Flipped: Rating / Next controls */}
            {isFlipped && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0c0d12] border border-[#171a24] rounded-2xl animate-fade-in">
                <span className="text-xs text-[#9ca3af]">Recall Confidence:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGrade(1)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => handleGrade(3)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleGrade(4)}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-slate-100"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleGrade(5)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30"
                  >
                    Easy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Progress & Ready to Practice Cards (Screenshot 2) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Progress Card */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 space-y-3 shadow-xl">
              <h4 className="text-sm font-bold text-white tracking-tight">Progress</h4>
              <div className="flex justify-between text-xs text-[#9ca3af]">
                <span>Mastery</span>
                <span className="text-white font-semibold">0%</span>
              </div>
              <div className="h-2 rounded-full bg-[#171a24] overflow-hidden">
                <div className="h-full rounded-full bg-white w-0" />
              </div>
              <div className="flex justify-between text-[11px] text-[#6b7280] pt-1">
                <span>0 known</span>
                <span>{totalCards} to learn</span>
              </div>
            </div>

            {/* Ready to Practice Card */}
            <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 text-center space-y-3.5 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-[#161822] border border-[#212534] flex items-center justify-center mx-auto text-white shadow-inner">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white tracking-tight">Ready to Practice?</h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Test your knowledge with spaced repetition
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/quests?topic=${encodeURIComponent(activeSubject)}`)}
                  className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
                >
                  Start Practice Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
