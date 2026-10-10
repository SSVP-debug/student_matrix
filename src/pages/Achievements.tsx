import { Sidebar } from '../components/Sidebar';
import { Trophy, Zap, Brain, Flame, Star, Target, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedDate?: string;
  progress: number;
}

interface Category {
  name: string;
  achievements: Achievement[];
}

interface AchievementsData {
  categories: Category[];
}

export const Achievements = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/data/achievements.json');
        const data: AchievementsData = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        // Fallback to empty array if fetch fails
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const totalAchievements = categories.reduce((sum, cat) => sum + cat.achievements.length, 0);
  const unlockedAchievements = categories.reduce(
    (sum, cat) => sum + cat.achievements.filter(a => a.isUnlocked).length,
    0
  );
  const percentage = Math.round((unlockedAchievements / totalAchievements) * 100);

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Brain': return <Brain {...iconProps} />;
      case 'Flame': return <Flame {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  const AchievementBadge = ({ 
    title, 
    description, 
    icon, 
    isUnlocked, 
    rarity, 
    unlockedDate, 
    progress 
  }: Achievement) => {
    const rarityStyles = {
      common: 'border-white/30 bg-white/5',
      rare: 'border-white/50 bg-white/10',
      epic: 'border-white/70 bg-white/15',
      legendary: 'border-white/90 bg-white/20'
    };

    const progressBarColor = isUnlocked ? 'bg-white' : 'bg-white/40';

    return (
      <GlassCard className={`p-6 transition-all duration-300 hover:scale-105 hover:bg-white/10 ${
        isUnlocked ? 'opacity-100' : 'opacity-60'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl border ${
            isUnlocked 
              ? rarityStyles[rarity] 
              : 'border-white/20 bg-white/5'
          }`}>
            <div className={isUnlocked ? 'text-white' : 'text-white/40'}>
              {getIconComponent(icon)}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
            isUnlocked 
              ? 'border-white/30 bg-white/10 text-white' 
              : 'border-white/20 bg-white/5 text-white/40'
          }`}>
            {rarity}
          </div>
        </div>

        <h3 className={`text-lg font-bold mb-2 ${
          isUnlocked ? 'text-white' : 'text-white/60'
        }`}>
          {title}
        </h3>
        
        <p className={`text-sm mb-4 ${
          isUnlocked ? 'text-white/70' : 'text-white/40'
        }`}>
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className={isUnlocked ? 'text-white/60' : 'text-white/40'}>
              Progress
            </span>
            <span className={isUnlocked ? 'text-white font-medium' : 'text-white/40'}>
              {isUnlocked ? 'Completed' : `${progress}%`}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ${
                isUnlocked ? 'bg-white' : progressBarColor
              }`}
              style={{ width: isUnlocked ? '100%' : `${progress}%` }}
            />
          </div>

          {isUnlocked && unlockedDate && (
            <div className="text-xs text-white/50 pt-2 border-t border-white/10">
              Unlocked {unlockedDate}
            </div>
          )}
        </div>
      </GlassCard>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 flex items-center justify-center">
          <div className="text-white text-lg">Loading Achievements...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Achievements
              </h1>
              <p className="text-white/60 capitalize">
                Track your cosmic accomplishments across the learning universe
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {unlockedAchievements}/{totalAchievements}
                </div>
                <div className="text-sm text-white/60">Unlocked</div>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Overall Progress
                </h2>
                <p className="text-white/60">
                  {unlockedAchievements} of {totalAchievements} achievements unlocked
                </p>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {percentage}%
              </div>
            </div>

            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          </GlassCard>

          {/* Categories Grid */}
          <div className="space-y-8">
            {categories.map((category, categoryIndex) => (
              <div key={category.name} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-white/60" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {category.name}
                  </h2>
                  <div className="text-sm text-white/40">
                    {category.achievements.filter(a => a.isUnlocked).length}/{category.achievements.length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {category.achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} {...achievement} />
                  ))}
                </div>

                {categoryIndex < categories.length - 1 && (
                  <div className="border-t border-white/10 pt-8" />
                )}
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <GlassCard className="p-6 mt-8">
            <h3 className="text-lg font-bold text-white mb-4">Achievement Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <div className="text-2xl font-bold text-white">{unlockedAchievements}</div>
                <div className="text-sm text-white/60">Unlocked</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <div className="text-2xl font-bold text-white">{totalAchievements - unlockedAchievements}</div>
                <div className="text-sm text-white/60">Locked</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <div className="text-2xl font-bold text-white">{percentage}%</div>
                <div className="text-sm text-white/60">Completion</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5">
                <div className="text-2xl font-bold text-white">
                  {categories.filter(cat => cat.achievements.every(a => a.isUnlocked)).length}
                </div>
                <div className="text-sm text-white/60">Categories Complete</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};