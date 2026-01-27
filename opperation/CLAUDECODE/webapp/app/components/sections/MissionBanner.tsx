'use client';

import { useState } from 'react';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../ui/ProgressBar';
import { CopyButton } from '../ui/CopyButton';
import type { LevelType, Mission } from '../../data/onboarding-data';
import { personas, levelGoals } from '../../data/onboarding-data';

export function MissionBanner({
  selectedLevel,
  checkedItems,
  onToggleCheck,
}: {
  selectedLevel: LevelType;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (level: LevelType, idx: number) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const persona = personas.find(p => p.level === selectedLevel);
  const goal = levelGoals.find(g => g.level === selectedLevel);
  const missions = goal?.missions ?? [];
  const totalItems = missions.length;
  const completedCount = missions.filter((_, idx) => checkedItems[`${selectedLevel}-${idx}`]).length;
  const isAllComplete = totalItems > 0 && completedCount === totalItems;
  const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        'p-6 rounded-2xl border transition-all',
        isAllComplete
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-300 dark:border-green-800'
          : 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200/60 dark:border-indigo-800/60'
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{persona?.icon}</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {persona?.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{persona?.description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{completedCount}</span>
            <span className="text-zinc-400">/{totalItems}</span>
          </div>
        </div>
        <ProgressBar percent={progressPercent} complete={isAllComplete} />
      </div>

      {/* Mission list */}
      <div className="space-y-3">
        {missions.map((mission, idx) => {
          const key = `${selectedLevel}-${idx}`;
          const isChecked = checkedItems[key] || false;
          const isExpanded = expandedIdx === idx && !isChecked;

          return (
            <MissionItem
              key={idx}
              mission={mission}
              index={idx}
              isChecked={isChecked}
              isExpanded={isExpanded}
              onToggle={() => setExpandedIdx(isExpanded ? null : idx)}
              onComplete={() => {
                onToggleCheck(selectedLevel, idx);
                setExpandedIdx(null);
              }}
            />
          );
        })}
      </div>

      {isAllComplete && (
        <div className="p-4 rounded-2xl bg-green-500 text-white text-center font-bold text-lg">
          All Clear!
        </div>
      )}
    </div>
  );
}

function MissionItem({
  mission,
  index,
  isChecked,
  isExpanded,
  onToggle,
  onComplete,
}: {
  mission: Mission;
  index: number;
  isChecked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}) {
  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all',
      isChecked
        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
        : 'border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm'
    )}>
      <button
        onClick={() => { if (!isChecked) onToggle(); }}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <span className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
          isChecked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-zinc-300 dark:border-zinc-600'
        )}>
          {isChecked && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={cn(
          'flex-1 font-medium',
          isChecked ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
        )}>
          {mission.title}
        </span>
        {isChecked ? (
          <span className="text-green-500 text-xs font-bold">CLEAR</span>
        ) : (
          <svg className={cn('w-5 h-5 text-zinc-400 transition-transform duration-300', isExpanded && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800 pt-5">
            <ol className="space-y-4">
              {mission.steps.map((step, sIdx) => (
                <li key={sIdx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {sIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{step.title}</p>
                    {step.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{step.description}</p>
                    )}
                    {step.code && (
                      <div className="relative mt-2">
                        <pre className="text-xs bg-zinc-900 text-green-400 p-3 rounded-xl overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                        <div className="absolute top-2 right-2">
                          <CopyButton text={step.code} />
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <button
              onClick={onComplete}
              className="mt-5 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
