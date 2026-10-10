import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useProfile } from '../engine/store';
import { levelFromXp } from '../engine/adaptive';
import { Flame, Sparkles } from 'lucide-react';

interface PageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  badge?: string;
}

export const Page = ({ title, subtitle, children, actions, badge }: PageProps) => {
  const p = useProfile();
  const lvl = levelFromXp(p.xp);

  return (
    <div className="flex min-h-screen text-stellar-text bg-stellar-bg selection:bg-stellar-violet/30 selection:text-white">
      <Sidebar />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full flex flex-col focus:outline-none"
      >
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stellar-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stellar-violet/20 text-stellar-purple border border-stellar-violet/30">
                  {badge}
                </span>
              )}
              <h1 className="cosmic-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-stellar-secondary text-sm md:text-base leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* Quick Learner Stats Pills */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stellar-surface/80 border border-stellar-border text-xs">
              <span className="flex items-center gap-1 text-stellar-warning font-semibold">
                <Flame className="w-3.5 h-3.5 fill-stellar-warning" aria-hidden />
                <span>{p.streak}d streak</span>
              </span>
              <span className="text-stellar-muted">·</span>
              <span className="flex items-center gap-1 text-stellar-cyan font-semibold">
                <Sparkles className="w-3.5 h-3.5" aria-hidden />
                <span>Lvl {lvl}</span>
              </span>
            </div>

            {actions}
          </div>
        </header>

        <div className="flex-1 space-y-6">{children}</div>
      </main>
    </div>
  );
};

export const Card = ({
  children,
  className = '',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) => (
  <section
    className={`glass-card glass-hover p-5 sm:p-6 transition-all duration-200 ${
      glow ? 'border-stellar-cyan/30 shadow-cyan-glow/20' : ''
    } ${className}`}
  >
    {children}
  </section>
);

export const Bar = ({
  value,
  label,
  height = 'h-2',
}: {
  value: number;
  label: string;
  height?: string;
}) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full ${height} rounded-full bg-white/10 overflow-hidden relative`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-stellar-violet via-stellar-purple to-stellar-cyan transition-all duration-500 ease-out shadow-[0_0_12px_rgba(56,189,248,0.5)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const Badge = ({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'violet' | 'cyan' | 'success' | 'warning' | 'error';
}) => {
  const styles = {
    default: 'bg-white/10 text-white border-white/15',
    violet: 'bg-stellar-violet/20 text-stellar-purple border-stellar-violet/30',
    cyan: 'bg-stellar-cyan/15 text-stellar-cyan border-stellar-cyan/30',
    success: 'bg-stellar-success/15 text-stellar-success border-stellar-success/30',
    warning: 'bg-stellar-warning/15 text-stellar-warning border-stellar-warning/30',
    error: 'bg-stellar-error/15 text-stellar-error border-stellar-error/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const btn =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none';

export const btnPrimary = `${btn} bg-white text-black hover:bg-slate-100 shadow-md`;
export const btnCyan = `${btn} bg-white text-black hover:bg-slate-100 shadow-md`;
export const btnWhite = `${btn} bg-white text-black hover:bg-slate-100 shadow-md`;
export const btnGhost = `${btn} border border-[#171a24] bg-[#0c0d12] text-white hover:bg-[#181a24] hover:border-white/20`;
export const btnDanger = `${btn} border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20`;
