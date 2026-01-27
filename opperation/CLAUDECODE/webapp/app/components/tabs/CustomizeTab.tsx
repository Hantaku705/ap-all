'use client';

import { useState } from 'react';
import { SkillCard } from '../sections/SkillCard';
import { CompareSection } from '../sections/CompareSection';
import { Accordion } from '../ui/Accordion';
import { FilterBar } from '../ui/FilterBar';
import { Card } from '../ui/Card';
import { CodeBlock } from '../ui/CodeBlock';
import {
  recommendedSkills,
  tips,
  skillCategoryLabels,
  type LevelType,
} from '../../data/onboarding-data';

export function CustomizeTab({ selectedLevel }: { selectedLevel: LevelType }) {
  const [filter, setFilter] = useState('all');
  const filteredSkills = recommendedSkills.filter((s) => filter === 'all' || s.category === filter);

  return (
    <div className="space-y-16">
      {/* Recommended Skills */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
          Custom Skills
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Copy and save to <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-xs">~/.claude/commands/</code>
        </p>

        <FilterBar
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'session', label: skillCategoryLabels.session },
            { value: 'git', label: skillCategoryLabels.git },
            { value: 'quality', label: skillCategoryLabels.quality },
            { value: 'dev', label: skillCategoryLabels.dev },
          ]}
        />

        <div className="space-y-4 mt-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      {/* Tips (intermediate+) */}
      {(selectedLevel === 'intermediate' || selectedLevel === 'advanced') && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Advanced Tips
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Level up your Claude Code workflow.
          </p>
          <div className="space-y-4">
            {tips.map((tip) => (
              <Accordion key={tip.id} title={tip.title}>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{tip.content}</p>
                {tip.code && <CodeBlock code={tip.code} />}
              </Accordion>
            ))}
          </div>
        </section>
      )}

      {/* Compare (intermediate+) */}
      {(selectedLevel === 'intermediate' || selectedLevel === 'advanced') && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            Compare Tools
          </h2>
          <CompareSection />
        </section>
      )}
    </div>
  );
}
