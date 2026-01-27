'use client';

import { Accordion } from '../ui/Accordion';
import { CodeBlock } from '../ui/CodeBlock';
import type { BuildGuideSection } from '../../data/onboarding-data';

export function BuildSectionCard({ section }: { section: BuildGuideSection }) {
  return (
    <Accordion
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">{section.title}</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-normal">{section.description}</div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {section.steps.map((step, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{step.title}</h4>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-9 mb-2">{step.description}</p>
            {step.code && (
              <div className="ml-9">
                <CodeBlock code={step.code} />
              </div>
            )}
          </div>
        ))}
      </div>
      {section.tips && section.tips.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wide">Tips</p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5">
            {section.tips.map((tip, i) => (
              <li key={i}>- {tip}</li>
            ))}
          </ul>
        </div>
      )}
      {section.links && section.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {section.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {link.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </Accordion>
  );
}
