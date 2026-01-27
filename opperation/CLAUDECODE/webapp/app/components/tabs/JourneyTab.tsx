'use client';

import { useState } from 'react';
import { MissionBanner } from '../sections/MissionBanner';
import { StepCard } from '../sections/StepCard';
import { CodeBlock } from '../ui/CodeBlock';
import { Card } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { cn } from '../../lib/cn';
import { gettingStartedSteps, glossary, starterKit, type LevelType } from '../../data/onboarding-data';

export function JourneyTab({
  selectedLevel,
  checkedItems,
  onToggleCheck,
}: {
  selectedLevel: LevelType;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (level: LevelType, idx: number) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [showGlossary, setShowGlossary] = useState(true);

  return (
    <div className="space-y-16">
      {/* Mission Progress */}
      <MissionBanner
        selectedLevel={selectedLevel}
        checkedItems={checkedItems}
        onToggleCheck={onToggleCheck}
      />

      {/* Glossary (beginner) */}
      {selectedLevel === 'beginner' && (
        <section>
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xl">📚</span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Key Terms
            </h2>
            <svg className={cn('w-5 h-5 text-zinc-400 transition-transform duration-300', showGlossary && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showGlossary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {glossary.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.term}</span>
                    {item.termEn && (
                      <span className="text-xs text-zinc-400">({item.termEn})</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.definition}</p>
                  <p className="mt-2 text-xs text-indigo-500 dark:text-indigo-400">{item.analogy}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Getting Started Steps */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Getting Started
          </h2>
          <span className="px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            ~32 min
          </span>
        </div>

        {/* Step pills */}
        <div className="mb-8 flex items-center gap-2 flex-wrap">
          {gettingStartedSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                index === activeStep
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : index < activeStep
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {gettingStartedSteps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} isActive={index === activeStep} />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium text-sm"
          >
            Previous
          </button>
          <button
            onClick={() => setActiveStep(Math.min(gettingStartedSteps.length - 1, activeStep + 1))}
            disabled={activeStep === gettingStartedSteps.length - 1}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-30 hover:bg-indigo-600 transition-colors font-medium text-sm"
          >
            Next
          </button>
        </div>
      </section>

      {/* Starter Kit (beginner + intermediate) */}
      {(selectedLevel === 'beginner' || selectedLevel === 'intermediate') && (
        <section>
          <div className="text-center p-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
              Starter Kit
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
              12 commands + 8 agents + 6 rules in one install
            </p>
            <div className="relative max-w-xl mx-auto">
              <div className="bg-zinc-900 text-zinc-100 p-5 rounded-xl font-mono text-sm">
                {starterKit.installCommand}
              </div>
              <div className="absolute top-3 right-3">
                <CopyButton text={starterKit.installCommand} />
              </div>
            </div>
            <a
              href={starterKit.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View on GitHub →
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { n: '12', label: 'Commands', color: 'text-indigo-500' },
              { n: '8', label: 'Agents', color: 'text-purple-500' },
              { n: '6', label: 'Rules', color: 'text-orange-500' },
              { n: '1', label: 'SDK Doc', color: 'text-teal-500' },
            ].map((s) => (
              <Card key={s.label} className="p-5 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.n}</div>
                <div className="text-sm text-zinc-400 mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
