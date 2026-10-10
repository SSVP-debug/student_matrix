import { Sidebar } from '../components/Sidebar';
import { Zap, Filter, Target, ChevronRight, Clock, Star, Lock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Mission {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  progress: number;
  subject: string;
  estimatedTime: string;
  questions: Question[];
  completed: boolean;
  locked: boolean;
}

interface MissionProgress {
  missionId: number;
  currentQuestion: number;
  score: number;
  completed: boolean;
  answers: number[];
}

export const Quests = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load missions from JSON file
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const response = await fetch('/data/quests.json');
        const data = await response.json();
        
        // Load progress from localStorage
        const savedProgress = localStorage.getItem('missionProgress');
        const progress: MissionProgress[] = savedProgress ? JSON.parse(savedProgress) : [];
        
        // Merge missions with saved progress
        const missionsWithProgress = data.missions.map((mission: Mission) => {
          const missionProgress = progress.find(p => p.missionId === mission.id);
          return {
            ...mission,
            progress: missionProgress ? 
              Math.round((missionProgress.currentQuestion / mission.questions.length) * 100) : 
              mission.progress,
            completed: missionProgress?.completed || false
          };
        });
        
        setMissions(missionsWithProgress);
      } catch (error) {
        console.error('Error loading missions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, []);

  // Save progress to localStorage
  const saveProgress = (missionId: number, currentQuestion: number, score: number, completed: boolean, answers: number[]) => {
    const savedProgress = localStorage.getItem('missionProgress');
    const progress: MissionProgress[] = savedProgress ? JSON.parse(savedProgress) : [];
    
    const existingIndex = progress.findIndex(p => p.missionId === missionId);
    const newProgress: MissionProgress = {
      missionId,
      currentQuestion,
      score,
      completed,
      answers
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = newProgress;
    } else {
      progress.push(newProgress);
    }

    localStorage.setItem('missionProgress', JSON.stringify(progress));
    
    // Update missions state with new progress
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { 
            ...mission, 
            progress: Math.round((currentQuestion / mission.questions.length) * 100),
            completed 
          }
        : mission
    ));
  };

  const filteredMissions = filter === 'all'
    ? missions
    : missions.filter(m => m.difficulty === filter);

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const handleMissionClick = (mission: Mission) => {
    if (mission.locked) return;
    
    // Load saved progress for this mission
    const savedProgress = localStorage.getItem('missionProgress');
    const progress: MissionProgress[] = savedProgress ? JSON.parse(savedProgress) : [];
    const missionProgress = progress.find(p => p.missionId === mission.id);
    
    setSelectedMission(mission);
    setCurrentQuestion(missionProgress?.currentQuestion || 0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(missionProgress?.score || 0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!selectedMission) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === selectedMission.questions[currentQuestion].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    
    // Save progress immediately
    const answers = Array(currentQuestion + 1).fill(null);
    answers[currentQuestion] = answerIndex;
    saveProgress(
      selectedMission.id,
      currentQuestion,
      newScore,
      false,
      answers
    );
  };

  const handleNextQuestion = () => {
    if (!selectedMission) return;
    
    const nextQuestion = currentQuestion + 1;
    const isCompleted = nextQuestion >= selectedMission.questions.length;
    
    if (isCompleted) {
      // Mission completed
      saveProgress(
        selectedMission.id,
        nextQuestion,
        score,
        true,
        Array(selectedMission.questions.length).fill(0).map((_, i) => 
          i === currentQuestion ? selectedAnswer! : 0
        )
      );
      setSelectedMission(null);
    } else {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-white bg-white/20';
      case 'Medium': return 'text-white bg-white/30';
      case 'Hard': return 'text-white bg-white/40';
      default: return 'text-white bg-white/20';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading Missions...</div>
        </main>
      </div>
    );
  }

  if (selectedMission) {
    const question = selectedMission.questions[currentQuestion];
    const isLastQuestion = currentQuestion === selectedMission.questions.length - 1;

    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <button 
                    onClick={() => setSelectedMission(null)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to Missions
                  </button>
                  <h1 className="text-2xl font-bold text-white">{selectedMission.title}</h1>
                  <p className="text-white/60">{selectedMission.subject} • {selectedMission.difficulty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Question {currentQuestion + 1} of {selectedMission.questions.length}</span>
                    <span>Score: {score}/{selectedMission.questions.length}</span>
                  </div>
                  <div className="w-32 bg-white/10 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / selectedMission.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question */}
              <GlassCard className="p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">{question.question}</h2>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showExplanation && handleAnswerSelect(index)}
                      className={`
                        w-full p-4 text-left rounded-2xl border transition-all duration-300
                        ${selectedAnswer === index
                          ? index === question.correctAnswer
                            ? 'bg-white/20 border-white text-white'
                            : 'bg-white/10 border-white/30 text-white/60'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                        }
                        ${showExplanation && index === question.correctAnswer
                          ? 'bg-white/20 border-white text-white'
                          : ''
                        }
                      `}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium
                          ${selectedAnswer === index || (showExplanation && index === question.correctAnswer)
                            ? 'bg-white border-white text-black'
                            : 'bg-transparent border-white/30 text-white/60'
                          }
                        `}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Explanation */}
              {showExplanation && (
                <GlassCard className="p-6 mb-6 border-white/20">
                  <h3 className="text-lg font-bold text-white mb-3">Explanation</h3>
                  <p className="text-white/80 leading-relaxed">{question.explanation}</p>
                </GlassCard>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {!showExplanation && selectedAnswer !== null && (
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="flex-1 bg-white text-black py-3 rounded-2xl font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    Show Explanation
                  </button>
                )}
                {showExplanation && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-white text-black py-3 rounded-2xl font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    {isLastQuestion ? 'Complete Mission' : 'Next Question'}
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mission Quests</h1>
              <p className="text-white/60 capitalize">Choose your next learning adventure</p>
            </div>
            <button 
              onClick={() => navigate('/quests')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-white/90 transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              Daily Challenge
            </button>
          </div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilter(level)}
                    className={`
                      px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border
                      ${filter === level
                        ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }
                    `}
                  >
                    {level === 'all' ? 'All Missions' : level}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <GlassCard key={mission.id} className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div onClick={() => handleMissionClick(mission)}>
                  {/* Mission Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{mission.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                        <span className="text-white/60 text-sm">{mission.subject}</span>
                      </div>
                    </div>
                    {mission.locked && (
                      <Lock className="w-5 h-5 text-white/40" />
                    )}
                    {mission.completed && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white font-medium">{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Mission Info */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-white/60">
                        <Star className="w-4 h-4" />
                        <span>{mission.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Clock className="w-4 h-4" />
                        <span>{mission.estimatedTime}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Empty State */}
          {filteredMissions.length === 0 && (
            <GlassCard className="text-center py-20">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Target className="w-16 h-16 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No missions found</h3>
              <p className="text-white/60">Try adjusting your filters</p>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
};