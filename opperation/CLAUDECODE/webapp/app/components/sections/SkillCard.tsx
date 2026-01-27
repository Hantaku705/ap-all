'use client';

import { Accordion } from '../ui/Accordion';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import { skillCategoryColors, skillCategoryLabels, type RecommendedSkill } from '../../data/onboarding-data';

export function SkillCard({ skill }: { skill: RecommendedSkill }) {
  return (
    <Accordion
      title={<code className="font-mono font-semibold">{skill.name}</code>}
      badge={
        <Badge color={skillCategoryColors[skill.category]}>
          {skillCategoryLabels[skill.category]}
        </Badge>
      }
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{skill.description}</p>
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950">
        <pre className="p-5 overflow-x-auto text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
          <code>{skill.definition}</code>
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={skill.definition} />
        </div>
      </div>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          <strong>Save to:</strong>{' '}
          <code className="bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
            ~/.claude/commands/{skill.id}.md
          </code>
        </p>
      </div>
    </Accordion>
  );
}
