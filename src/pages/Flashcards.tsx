import { Sidebar } from '../components/Sidebar';
import { Plus, Sparkles, Zap, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface Subject {
  id: number;
  name: string;
  icon: string;
  cards: Flashcard[];
}

export const Flashcards = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);

  // Load flashcards data
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const response = await fetch('/data/flashcards.json');
        const data = await response.json();
        setSubjects(data.subjects);
        setSelectedSubject(data.subjects[0]); // Default to first subject
      } catch (error) {
        console.error('Error loading flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const handleNextCard = () => {
    if (!selectedSubject) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % selectedSubject.cards.length);
  };

  const handlePrevCard = () => {
    if (!selectedSubject) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + selectedSubject.cards.length) % selectedSubject.cards.length);
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkKnown = () => {
    if (!selectedSubject) return;
    const currentCardId = selectedSubject.cards[currentCardIndex].id;
    setKnownCards(prev => 
      prev.includes(currentCardId) 
        ? prev.filter(id => id !== currentCardId)
        : [...prev, currentCardId]
    );
  };

  const handleStartPractice = () => {
    setPracticeMode(true);
    setCurrentCardIndex(0);
    setKnownCards([]);
    setIsFlipped(false);
  };

  const handleExitPractice = () => {
    setPracticeMode(false);
    setKnownCards([]);
    setIsFlipped(false);
  };

  const getProgressPercentage = () => {
    if (!selectedSubject) return 0;
    return (knownCards.length / selectedSubject.cards.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading Flashcards...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Flashcards</h1>
              <p className="text-white/60 capitalize">Master concepts through active recall</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white">
                <Plus className="w-4 h-4" />
                Create Set
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300">
                <Sparkles className="w-4 h-4" />
                AI Generate
              </button>
            </div>
          </div>

          {/* Subject Selection */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Choose Subject</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setPracticeMode(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-300 text-center ${
                    selectedSubject?.id === subject.id
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{subject.icon}</div>
                  <div className="text-sm font-medium">{subject.name}</div>
                  <div className="text-xs text-white/60 mt-1">{subject.cards.length} cards</div>
                </button>
              ))}
            </div>
          </GlassCard>

          {selectedSubject && (
            <>
              {/* Flashcard Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Flashcard */}
                <div className="lg:col-span-2">
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">
                        {selectedSubject.name} Flashcards
                        {practiceMode && <span className="text-white/60 text-lg ml-2">• Practice Mode</span>}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>Card {currentCardIndex + 1} of {selectedSubject.cards.length}</span>
                        {practiceMode && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            {knownCards.length}/{selectedSubject.cards.length} mastered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flashcard */}
                    <div className="relative h-80 md:h-96 perspective-1000">
                      <div
                        className={`relative w-full h-full preserve-3d transition-all duration-500 cursor-pointer ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={handleCardFlip}
                      >
                        {/* Front of card */}
                        <div className="absolute inset-0 backface-hidden bg-white/10 border-2 border-white/20 rounded-3xl p-8 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-4">{selectedSubject.icon}</div>
                            <h4 className="text-2xl font-bold text-white mb-4">Question</h4>
                            <p className="text-lg text-white/90 leading-relaxed">
                              {selectedSubject.cards[currentCardIndex].question}
                            </p>
                            <p className="text-sm text-white/60 mt-6">Click to reveal answer</p>
                          </div>
                        </div>

                        {/* Back of card */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white/10 border-2 border-white/20 rounded-3xl p-8 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-4">{selectedSubject.icon}</div>
                            <h4 className="text-2xl font-bold text-white mb-4">Answer</h4>
                            <p className="text-lg text-white/90 leading-relaxed">
                              {selectedSubject.cards[currentCardIndex].answer}
                            </p>
                            <p className="text-sm text-white/60 mt-6">Click to see question</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Controls */}
                    <div className="flex items-center justify-between mt-6">
                      <button
                        onClick={handlePrevCard}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-3">
                        {practiceMode && (
                          <button
                            onClick={handleMarkKnown}
                            className={`px-4 py-2 rounded-2xl border transition-all duration-300 ${
                              knownCards.includes(selectedSubject.cards[currentCardIndex].id)
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                            }`}
                          >
                            {knownCards.includes(selectedSubject.cards[currentCardIndex].id)
                              ? 'Mark as Unknown'
                              : 'Mark as Known'}
                          </button>
                        )}
                        <button
                          onClick={handleCardFlip}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Flip Card
                        </button>
                      </div>

                      <button
                        onClick={handleNextCard}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Progress */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Mastery</span>
                        <span className="text-white font-medium">{Math.round(getProgressPercentage())}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white/60">
                        <span>{knownCards.length} known</span>
                        <span>{selectedSubject.cards.length - knownCards.length} to learn</span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Practice Mode */}
                  <GlassCard className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {practiceMode ? 'Practice Mode' : 'Ready to Practice?'}
                      </h3>
                      <p className="text-white/70 mb-6 text-sm">
                        {practiceMode 
                          ? 'Mark cards as known to track your progress'
                          : 'Test your knowledge with spaced repetition'
                        }
                      </p>
                      {practiceMode ? (
                        <button
                          onClick={handleExitPractice}
                          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white"
                        >
                          Exit Practice
                        </button>
                      ) : (
                        <button
                          onClick={handleStartPractice}
                          className="w-full px-4 py-3 rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300"
                        >
                          Start Practice Session
                        </button>
                      )}
                    </div>
                  </GlassCard>

                  {/* Quick Stats */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-sm text-white/60">Total Cards</span>
                        <span className="text-white font-medium">{selectedSubject.cards.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-sm text-white/60">Current Set</span>
                        <span className="text-white font-medium">{selectedSubject.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-sm text-white/60">Completion</span>
                        <span className="text-white font-medium">{Math.round(getProgressPercentage())}%</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};