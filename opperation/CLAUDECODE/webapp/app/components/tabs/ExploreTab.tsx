'use client';

import { useState } from 'react';
import { FeatureCard } from '../sections/FeatureCard';
import { ArchitectureCard } from '../sections/ArchitectureCard';
import { FilterBar } from '../ui/FilterBar';
import { Card } from '../ui/Card';
import {
  features,
  architectureElements,
  architectureColors,
  categoryLabels,
  type LevelType,
} from '../../data/onboarding-data';

export function ExploreTab({ selectedLevel }: { selectedLevel: LevelType }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<'features' | 'architecture'>('features');

  const filteredFeatures = features.filter((f) => {
    const matchesCategory = filter === 'all' || f.category === filter;
    const matchesSearch = search === '' ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Section toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSection('features')}
          className={`text-lg font-bold tracking-tight transition-colors ${
            section === 'features' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500'
          }`}
        >
          Features
        </button>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <button
          onClick={() => setSection('architecture')}
          className={`text-lg font-bold tracking-tight transition-colors ${
            section === 'architecture' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500'
          }`}
        >
          Architecture
        </button>
      </div>

      {section === 'features' && (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm"
            />
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'skill', label: categoryLabels.skill },
                { value: 'command', label: categoryLabels.command },
                { value: 'agent', label: categoryLabels.agent },
                { value: 'rule', label: categoryLabels.rule },
              ]}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['skill', 'command', 'agent', 'rule'] as const).map((cat) => (
              <Card key={cat} className="p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {features.filter((f) => f.category === cat).length}
                </div>
                <div className="text-sm text-zinc-400">{categoryLabels[cat]}</div>
              </Card>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map((f) => (
              <FeatureCard key={f.id} feature={f} />
            ))}
          </div>
          {filteredFeatures.length === 0 && (
            <div className="text-center py-16 text-zinc-400">No features found</div>
          )}
        </>
      )}

      {section === 'architecture' && (
        <>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Claude Code is built from 7 core elements. Understanding their roles helps you configure your ideal setup.
          </p>

          {/* Visual map */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {architectureElements.slice(0, 4).map((el) => (
                <div key={el.id} className={`p-4 rounded-xl text-center ${architectureColors[el.id]} border`}>
                  <span className="text-2xl">{el.icon}</span>
                  <p className="font-semibold text-sm mt-1">{el.name}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {architectureElements.slice(4).map((el) => (
                <div key={el.id} className={`p-4 rounded-xl text-center ${architectureColors[el.id]} border`}>
                  <span className="text-2xl">{el.icon}</span>
                  <p className="font-semibold text-sm mt-1">{el.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architectureElements.map((el) => (
              <ArchitectureCard key={el.id} element={el} />
            ))}
          </div>

          {/* Comparison table (intermediate+) */}
          {(selectedLevel === 'intermediate' || selectedLevel === 'advanced') && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="p-4 text-left font-semibold border-b border-zinc-200 dark:border-zinc-700">Aspect</th>
                      <th className="p-4 text-left font-semibold text-blue-600 border-b border-zinc-200 dark:border-zinc-700">Skills</th>
                      <th className="p-4 text-left font-semibold text-green-600 border-b border-zinc-200 dark:border-zinc-700">Commands</th>
                      <th className="p-4 text-left font-semibold text-purple-600 border-b border-zinc-200 dark:border-zinc-700">Agents</th>
                      <th className="p-4 text-left font-semibold text-orange-600 border-b border-zinc-200 dark:border-zinc-700">Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[
                      ['Invoke', '/skill', '/command', 'Auto-delegate', 'Always active'],
                      ['Scope', 'Workflow', 'Single action', 'Per task', 'All sessions'],
                      ['Interactive', 'Yes', 'Minimal', 'Independent', 'No'],
                    ].map(([label, ...cells], i) => (
                      <tr key={i}>
                        <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">{label}</td>
                        {cells.map((c, j) => (
                          <td key={j} className="p-4 text-zinc-500 dark:text-zinc-400">{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Folder structure */}
          <Card className="p-6">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">Folder Structure</h3>
            <pre className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-x-auto">
{`~/.claude/
├── skills/          # Workflow definitions
├── commands/        # Instant commands
├── agents/          # Subagent definitions
├── rules/           # Always-on rules
├── settings.json    # Hooks config
└── memories/        # Saved context

~/.claude.json       # MCP config

project/
└── CLAUDE.md        # Project settings`}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}
