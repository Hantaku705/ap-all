'use client';

import { cn } from '../../lib/cn';
import { CodeBlock } from '../ui/CodeBlock';
import type { Step } from '../../data/onboarding-data';

export function StepCard({ step, index, isActive }: { step: Step; index: number; isActive: boolean }) {
  return (
    <div className={cn(
      'p-6 rounded-2xl border-2 transition-all duration-300',
      isActive
        ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
        : 'border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900'
    )}>
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{step.title}</h3>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              {step.duration}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.content}</p>
          {step.code && <CodeBlock code={step.code} />}
          {step.tips && step.tips.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wide">Tips</p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">-</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
