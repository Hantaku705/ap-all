'use client';

import { useState } from 'react';
import { ExampleCard } from '../sections/ExampleCard';
import { BuildSectionCard } from '../sections/BuildSectionCard';
import { FilterBar } from '../ui/FilterBar';
import { Card } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { examples, buildGuideSections, type LevelType } from '../../data/onboarding-data';

export function PracticeTab({ selectedLevel }: { selectedLevel: LevelType }) {
  const [filter, setFilter] = useState('all');
  const categories = ['all', ...Array.from(new Set(examples.map((e) => e.category)))];
  const filteredExamples = examples.filter((e) => filter === 'all' || e.category === filter);

  return (
    <div className="space-y-16">
      {/* Prompt Examples */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
          Prompt Examples
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Copy and try these prompts in Claude Code.
        </p>

        <FilterBar
          value={filter}
          onChange={setFilter}
          options={categories.map((c) => ({ value: c, label: c === 'all' ? 'All' : c }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredExamples.map((ex) => (
            <ExampleCard key={ex.id} example={ex} />
          ))}
        </div>
      </section>

      {/* Build Guide (advanced) */}
      {(selectedLevel === 'intermediate' || selectedLevel === 'advanced') && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Build Guide
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Build real products with Claude Code in 4 steps.
          </p>

          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {buildGuideSections.map((s) => (
              <Card key={s.id} className="p-4 text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                  {s.title.split('(')[0]}
                </p>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {buildGuideSections.map((section) => (
              <BuildSectionCard key={section.id} section={section} />
            ))}
          </div>

          {/* One-liner demo */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">One-liner magic</h4>
            <div className="relative">
              <div className="bg-zinc-900 text-zinc-100 p-5 rounded-xl text-sm font-mono">
                Next.jsでTodoアプリを作って、Supabaseでデータ保存して、Vercelにデプロイして
              </div>
              <div className="absolute top-3 right-3">
                <CopyButton text="Next.jsでTodoアプリを作って、Supabaseでデータ保存して、Vercelにデプロイして" />
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Claude Code can handle the entire flow from scaffolding to deployment.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
