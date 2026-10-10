import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export const Page = ({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) => (
  <div className="flex min-h-screen text-white">
    <Sidebar />
    <main id="main" tabIndex={-1} className="flex-1 min-w-0 p-4 md:p-8 pt-24 md:pt-8 max-w-6xl mx-auto w-full">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </main>
  </div>
);

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`glass rounded-3xl p-5 ${className}`}>{children}</section>
);

export const Bar = ({ value, label }: { value: number; label: string }) => (
  <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-white/10 overflow-hidden">
    <div className="h-full rounded-full bg-gradient-to-r from-[#5A00FF] to-[#00E5FF]" style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
);

export const btn = 'px-4 py-2 rounded-2xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
export const btnPrimary = `${btn} bg-white text-black hover:bg-white/90`;
export const btnGhost = `${btn} border border-white/20 text-white hover:bg-white/10`;
