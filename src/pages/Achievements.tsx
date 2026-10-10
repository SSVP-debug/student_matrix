import { Trophy, Zap, Brain, Flame, Star, Target, Award, BookOpen, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Page, Card, Bar } from '../components/Page';
import { useProfile } from '../engine/store';
import { levelFromXp } from '../engine/adaptive';

interface A { title: string; desc: string; icon: LucideIcon; value: number; goal: number; rarity: 'common' | 'rare' | 'epic' | 'legendary' }

const color = { common: 'text-white', rare: 'text-cyan-300', epic: 'text-violet-300', legendary: 'text-amber-300' } as const;

export const Achievements = () => {
  const p = useProfile();
  const mastered = Object.values(p.topics).filter((t) => t.mastery >= 0.85 && t.attempts >= 5).length;
  const list: A[] = [
    { title: 'First Steps', desc: 'Answer your first question', icon: Star, value: p.answered, goal: 1, rarity: 'common' },
    { title: 'Knowledge Seeker', desc: 'Answer 50 questions', icon: Target, value: p.answered, goal: 50, rarity: 'rare' },
    { title: 'Relentless', desc: 'Answer 250 questions', icon: Zap, value: p.answered, goal: 250, rarity: 'epic' },
    { title: 'On a Roll', desc: 'Reach a 3-day streak', icon: Flame, value: p.bestStreak, goal: 3, rarity: 'common' },
    { title: 'Habit Forged', desc: 'Reach a 14-day streak', icon: Flame, value: p.bestStreak, goal: 14, rarity: 'epic' },
    { title: 'Flawless', desc: 'Finish a 5+ question session with no mistakes', icon: Trophy, value: p.perfectSessions, goal: 1, rarity: 'rare' },
    { title: 'Topic Master', desc: 'Reach 85% mastery in a topic', icon: Brain, value: mastered, goal: 1, rarity: 'rare' },
    { title: 'Polymath', desc: 'Master 3 topics', icon: Award, value: mastered, goal: 3, rarity: 'legendary' },
    { title: 'Memory Builder', desc: 'Review 100 flashcards', icon: Layers, value: p.cardsReviewed, goal: 100, rarity: 'rare' },
    { title: 'Note Taker', desc: 'Create study material from your own notes', icon: BookOpen, value: p.notes.length, goal: 1, rarity: 'common' },
    { title: 'Rising Star', desc: 'Reach level 5', icon: Star, value: levelFromXp(p.xp), goal: 5, rarity: 'rare' },
    { title: 'Deep Focus', desc: 'Study for a total of 2 hours', icon: Brain, value: p.studyMs / 3_600_000, goal: 2, rarity: 'epic' },
  ];
  const got = list.filter((a) => a.value >= a.goal).length;
  return (
    <Page title="Achievements" subtitle={`${got} of ${list.length} unlocked`}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((a) => {
          const ok = a.value >= a.goal; const Icon = a.icon;
          return (
            <Card key={a.title} className={ok ? '' : 'opacity-80'}>
              <div className="flex items-center gap-3 mb-2"><Icon className={`w-6 h-6 ${ok ? color[a.rarity] : 'text-white/60'}`} aria-hidden /><h2 className="font-semibold">{a.title}</h2></div>
              <p className="text-sm text-white/70 mb-3">{a.desc}</p>
              <Bar value={Math.min(1, a.value / a.goal)} label={a.title} />
              <p className="text-xs text-white/60 mt-2">{ok ? `Unlocked · ${a.rarity}` : `${Math.floor(a.value * 10) / 10} / ${a.goal}`}</p>
            </Card>
          );
        })}
      </div>
    </Page>
  );
};
