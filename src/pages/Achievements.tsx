import { Star, Target, Trophy, Brain, Award, Layers, BookOpen, Sparkles, Flame, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useProfile } from '../engine/store';
import { levelFromXp } from '../engine/adaptive';

interface A {
  title: string;
  desc: string;
  icon: LucideIcon;
  value: number;
  goal: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'Knowledge Galaxy' | 'Math Nebula';
}

export const Achievements = () => {
  const p = useProfile();
  const mastered = Object.values(p.topics).filter((t) => t.mastery >= 0.85 && t.attempts >= 5).length;
  const lvl = levelFromXp(p.xp);

  const list: A[] = [
    // Knowledge Galaxy
    { title: 'First Steps', desc: 'Complete your first learning mission', icon: Star, value: p.answered, goal: 1, rarity: 'common', category: 'Knowledge Galaxy' },
    { title: 'Knowledge Seeker', desc: 'Complete 10 missions', icon: Target, value: p.answered, goal: 10, rarity: 'rare', category: 'Knowledge Galaxy' },
    { title: 'Master Explorer', desc: 'Complete 50 missions', icon: Trophy, value: p.answered, goal: 50, rarity: 'epic', category: 'Knowledge Galaxy' },
    { title: 'On a Roll', desc: 'Reach a 3-day learning streak', icon: Flame, value: p.bestStreak, goal: 3, rarity: 'common', category: 'Knowledge Galaxy' },
    { title: 'Habit Forged', desc: 'Reach a 14-day learning streak', icon: Flame, value: p.bestStreak, goal: 14, rarity: 'epic', category: 'Knowledge Galaxy' },
    { title: 'Flawless Session', desc: 'Finish a mission with 100% accuracy', icon: Zap, value: p.perfectSessions, goal: 1, rarity: 'rare', category: 'Knowledge Galaxy' },

    // Math Nebula & Advanced
    { title: 'Topic Master', desc: 'Reach 85% mastery in any topic', icon: Brain, value: mastered, goal: 1, rarity: 'rare', category: 'Math Nebula' },
    { title: 'Polymath', desc: 'Master 3 or more topics', icon: Award, value: mastered, goal: 3, rarity: 'legendary', category: 'Math Nebula' },
    { title: 'Memory Builder', desc: 'Review 50 flashcards using active recall', icon: Layers, value: p.cardsReviewed, goal: 50, rarity: 'rare', category: 'Math Nebula' },
    { title: 'Note Architect', desc: 'Create study material from your own notes', icon: BookOpen, value: p.notes.length, goal: 1, rarity: 'common', category: 'Math Nebula' },
    { title: 'Rising Star', desc: 'Reach level 5 in your cosmic journey', icon: Sparkles, value: lvl, goal: 5, rarity: 'rare', category: 'Math Nebula' },
    { title: 'Deep Focus', desc: 'Study for a total of 2 hours', icon: Brain, value: p.studyMs / 3_600_000, goal: 2, rarity: 'epic', category: 'Math Nebula' },
  ];

  const unlockedCount = list.filter((a) => a.value >= a.goal).length;
  const overallPct = Math.round((unlockedCount / list.length) * 100);

  const categories = ['Knowledge Galaxy', 'Math Nebula'] as const;

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      <Sidebar />

      <main id="main" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 max-w-[1400px] mx-auto w-full space-y-8">
        {/* Header (Screenshot 1) */}
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Achievements
            </h1>
            <p className="text-sm text-[#9ca3af]">
              Track Your Cosmic Accomplishments Across The Learning Universe
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl sm:text-4xl font-black text-white leading-none">
              {unlockedCount}/{list.length}
            </p>
            <p className="text-xs text-[#9ca3af] mt-1 font-medium">Unlocked</p>
          </div>
        </header>

        {/* Overall Progress Card (Screenshot 1) */}
        <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-6 md:p-7 space-y-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Overall Progress</h2>
              <p className="text-sm text-[#9ca3af]">
                {unlockedCount} of {list.length} achievements unlocked
              </p>
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none">
              {overallPct}%
            </span>
          </div>

          <div className="h-3 rounded-full bg-[#171a24] overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Categories (Screenshot 1) */}
        <div className="space-y-8">
          {categories.map((cat) => {
            const itemsInCat = list.filter((a) => a.category === cat);
            const unlockedInCat = itemsInCat.filter((a) => a.value >= a.goal).length;

            return (
              <section key={cat} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white inline-block" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {cat}
                  </h3>
                  <span className="text-xs font-semibold text-[#6b7280]">
                    {unlockedInCat}/{itemsInCat.length}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsInCat.map((a) => {
                    const ok = a.value >= a.goal;
                    const Icon = a.icon;
                    const pct = Math.min(100, Math.round((a.value / a.goal) * 100));

                    return (
                      <div
                        key={a.title}
                        className={`bg-[#0c0d12] border border-[#171a24] rounded-2xl p-5 space-y-4 transition-all ${
                          ok ? 'opacity-100' : 'opacity-70'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-[#141620] border border-[#202534] flex items-center justify-center text-white shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#141620] border border-[#202534] text-[#9ca3af] uppercase tracking-wide">
                            {a.rarity}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">{a.title}</h4>
                          <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">{a.desc}</p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs text-[#9ca3af]">
                            <span>Progress</span>
                            <span className={ok ? 'text-white font-semibold' : ''}>
                              {ok ? 'Completed' : `${pct}%`}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#171a24] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-white transition-all duration-300"
                              style={{ width: `${ok ? 100 : pct}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-[#6b7280]">
                          {ok ? 'Unlocked' : 'In progress'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
