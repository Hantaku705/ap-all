'use client';

import { cn } from '../../lib/cn';
import type { LevelType } from '../../data/onboarding-data';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'journey', label: 'Journey', icon: '🚀' },
  { id: 'explore', label: 'Explore', icon: '🔍' },
  { id: 'practice', label: 'Practice', icon: '💡' },
  { id: 'customize', label: 'Customize', icon: '⚙️' },
  { id: 'reference', label: 'Reference', icon: '📚' },
];

const LEVELS = [
  { id: 'beginner' as const, label: 'Lv.1', icon: '🌱' },
  { id: 'intermediate' as const, label: 'Lv.2', icon: '🌿' },
  { id: 'advanced' as const, label: 'Lv.3', icon: '🌳' },
];

export function Header({
  selectedLevel,
  activeTab,
  onLevelChange,
  onTabChange,
  levelComplete,
}: {
  selectedLevel: LevelType;
  activeTab: string;
  onLevelChange: (level: LevelType) => void;
  onTabChange: (tab: string) => void;
  levelComplete: Record<LevelType, boolean>;
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Row 1: Logo + Level + Docs */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Claude Code
          </h1>

          {/* Segmented control */}
          <div className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => onLevelChange(level.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                  selectedLevel === level.id
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                )}
              >
                <span>{level.icon}</span>
                <span>{level.label}</span>
                {levelComplete[level.id] && <span className="text-green-500 text-xs">&#10003;</span>}
              </button>
            ))}
          </div>

          <a
            href="https://docs.anthropic.com/en/docs/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            Docs
          </a>
        </div>

        {/* Row 2: Tab navigation */}
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export { TABS };
