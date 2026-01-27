'use client';

import { Card } from '../ui/Card';
import { glossary, architectureElements, starterKit, type LevelType } from '../../data/onboarding-data';

export function ReferenceTab({ selectedLevel }: { selectedLevel: LevelType }) {
  return (
    <div className="space-y-16">
      {/* Glossary */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Glossary
        </h2>
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
      </section>

      {/* Quick Reference: Folder Structure */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Folder Structure
        </h2>
        <Card className="p-6">
          <pre className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-x-auto">
{`~/.claude/
├── skills/          # Workflow definitions
├── commands/        # Instant commands (/xxx)
├── agents/          # Subagent definitions
├── rules/           # Always-on rules
├── settings.json    # Hooks config
└── memories/        # Saved context

~/.claude.json       # MCP config (external service connections)

project/
├── CLAUDE.md        # Project-specific settings
├── .claude/
│   ├── commands/    # Project commands
│   ├── agents/      # Project agents
│   └── memories/    # Project memories
└── HANDOFF.md       # Session handoff`}
          </pre>
        </Card>
      </section>

      {/* Element Quick Ref */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          7 Elements at a Glance
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="p-4 text-left font-semibold border-b border-zinc-200 dark:border-zinc-700">Element</th>
                  <th className="p-4 text-left font-semibold border-b border-zinc-200 dark:border-zinc-700">What</th>
                  <th className="p-4 text-left font-semibold border-b border-zinc-200 dark:border-zinc-700">Location</th>
                  <th className="p-4 text-left font-semibold border-b border-zinc-200 dark:border-zinc-700">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {architectureElements.map((el) => (
                  <tr key={el.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <span className="mr-2">{el.icon}</span>{el.name}
                    </td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400">{el.definition}</td>
                    <td className="p-4">
                      <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-zinc-600 dark:text-zinc-300">{el.location}</code>
                    </td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400 text-xs">{el.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Starter Kit Commands Quick Ref */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Starter Kit Commands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {starterKit.commands.map((cmd) => (
            <Card key={cmd.name} className="p-4 flex items-center gap-3">
              <code className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-sm">{cmd.name}</code>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{cmd.description}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
