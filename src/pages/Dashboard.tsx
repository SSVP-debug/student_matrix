import { Sidebar } from '../components/Sidebar';
import { User, Star, Target, Clock, Trophy, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();

  const constellations = [
    { id: 1, title: 'Algebra Basics', x: 20, y: 25, completed: true, locked: false },
    { id: 2, title: 'Geometry', x: 35, y: 35, completed: true, locked: false },
    { id: 3, title: 'Trigonometry', x: 50, y: 30, completed: false, locked: false },
    { id: 4, title: 'Calculus I', x: 65, y: 40, completed: false, locked: false },
    { id: 5, title: 'Calculus II', x: 80, y: 35, completed: false, locked: true },
    { id: 6, title: 'Physics', x: 30, y: 60, completed: true, locked: false },
    { id: 7, title: 'Chemistry', x: 50, y: 65, completed: false, locked: false },
    { id: 8, title: 'Biology', x: 70, y: 60, completed: false, locked: true },
  ];

  const quickStats = [
    { label: 'Topics Completed', value: '24', icon: BookOpen, color: 'text-white' },
    { label: 'Missions Active', value: '5', icon: Target, color: 'text-white' },
    { label: 'Study Time', value: '47h', icon: Clock, color: 'text-white' },
    { label: 'Achievements', value: '18', icon: Trophy, color: 'text-white' },
  ];

  const recentMissions = [
    { title: 'Quantum Mechanics Intro', progress: 80, subject: 'Physics' },
    { title: 'Organic Chemistry Basics', progress: 45, subject: 'Chemistry' },
    { title: 'Linear Algebra', progress: 20, subject: 'Mathematics' },
  ];

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const ConstellationNode = ({ title, isCompleted, isLocked, x, y, onClick }: any) => (
    <button
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      disabled={isLocked}
    >
      <div className={`
        relative w-10 h-10 rounded-full border-2 flex items-center justify-center
        ${isCompleted 
          ? 'bg-white/20 border-white shadow-lg shadow-white/20' 
          : isLocked 
          ? 'bg-white/5 border-white/30 opacity-50' 
          : 'bg-white/10 border-white/50 hover:border-white hover:bg-white/20'
        }
      `}>
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-black" />
          </div>
        )}
        {isLocked && (
          <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white/50 rounded-full" />
          </div>
        )}
        {!isCompleted && !isLocked && (
          <div className="w-4 h-4 bg-white/60 rounded-full animate-pulse" />
        )}
      </div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
        <span className={`
          text-xs font-medium whitespace-nowrap
          ${isLocked ? 'text-white/40' : 'text-white/80'}
        `}>
          {title}
        </span>
      </div>
    </button>
  );

  const StreakIndicator = ({ days }: { days: number }) => (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-white" />
        <span className="text-white font-medium">{days} days</span>
      </div>
      <div className="text-xs text-white/60">streak</div>
    </div>
  );

  const XPBar = ({ current, max }: { current: number; max: number }) => {
    const percentage = (current / max) * 100;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Progress</span>
          <span className="text-white font-medium">{current}/{max} XP</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 capitalize">
                Welcome back, <span className="text-white">Zero</span>
              </h1>
              <p className="text-white/60 capitalize">Continue your journey through the cosmos of knowledge</p>
            </div>

            <div className="flex items-center gap-4">
              <StreakIndicator days={12} />
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cosmic Map */}
            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Cosmic Map</h2>
                <button className="text-white/60 hover:text-white transition-colors text-sm">
                  View Full Map
                </button>
              </div>
              <div className="relative h-[400px] md:h-[500px] bg-black/50 rounded-3xl overflow-hidden border border-white/10">
                {/* Star Background */}
                <div className="absolute inset-0">
                  {[...Array(100)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.8 + 0.2,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Constellation Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <line x1="20%" y1="25%" x2="35%" y2="35%" stroke="white" strokeWidth="2" opacity="0.5" />
                  <line x1="35%" y1="35%" x2="50%" y2="30%" stroke="white" strokeWidth="2" opacity="0.5" />
                  <line x1="50%" y1="30%" x2="65%" y2="40%" stroke="white" strokeWidth="2" opacity="0.3" />
                  <line x1="65%" y1="40%" x2="80%" y2="35%" stroke="white" strokeWidth="2" opacity="0.2" strokeDasharray="5,5" />
                  <line x1="35%" y1="35%" x2="30%" y2="60%" stroke="white" strokeWidth="2" opacity="0.5" />
                  <line x1="30%" y1="60%" x2="50%" y2="65%" stroke="white" strokeWidth="2" opacity="0.3" />
                  <line x1="50%" y1="65%" x2="70%" y2="60%" stroke="white" strokeWidth="2" opacity="0.2" strokeDasharray="5,5" />
                </svg>

                {/* Constellation Nodes */}
                {constellations.map((node) => (
                  <ConstellationNode
                    key={node.id}
                    title={node.title}
                    isCompleted={node.completed}
                    isLocked={node.locked}
                    x={node.x}
                    y={node.y}
                    onClick={() => navigate('/quests')}
                  />
                ))}
              </div>
            </GlassCard>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <XPBar current={2450} max={5000} />
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white/60">Level</span>
                      <span className="text-2xl font-bold text-white">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Rank</span>
                      <span className="text-lg font-bold text-white">
                         Explorer
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Stats */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {quickStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-white/60">{stat.label}</span>
                        </div>
                        <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Recent Missions */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent Missions</h3>
                  <button 
                    onClick={() => navigate('/quests')}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentMissions.map((mission, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => navigate('/quests')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-medium text-sm">{mission.title}</span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">{mission.subject}</span>
                        <span className="text-white font-medium">{mission.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};