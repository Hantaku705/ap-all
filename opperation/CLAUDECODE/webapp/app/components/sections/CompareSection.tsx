import { Card } from '../ui/Card';

export function CompareSection() {
  return (
    <div className="space-y-8">
      {/* 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompareCard
          color="indigo"
          tag="Official SDK"
          title="Claude Agent SDK"
          description="Python/TypeScript for custom app development"
          points={['CI/CD pipeline integration', 'Custom app development', 'Production automation']}
        />
        <CompareCard
          color="purple"
          tag="Config Pack"
          title="Everything Claude Code"
          description="Hackathon-winning configs to supercharge Claude Code"
          points={['9 specialized agents', 'Multiple skills & commands', 'Community-tested']}
        />
        <CompareCard
          color="emerald"
          tag="Config Pack"
          title="Starter Kit"
          description="Team configs, 1 command install"
          points={['12 commands + 8 agents + 6 rules', 'Japanese-ready', 'Battle-tested']}
        />
      </div>

      {/* Comparison table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="p-4 text-left font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700">Item</th>
                <th className="p-4 text-left font-semibold text-indigo-600 dark:text-indigo-400 border-b border-zinc-200 dark:border-zinc-700">Agent SDK</th>
                <th className="p-4 text-left font-semibold text-purple-600 dark:text-purple-400 border-b border-zinc-200 dark:border-zinc-700">Everything CC</th>
                <th className="p-4 text-left font-semibold text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-700">Starter Kit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                ['Type', 'Official library (SDK)', 'Config files', 'Config files'],
                ['By', 'Anthropic', 'Community', 'Internal team'],
                ['For', 'Developers (write code)', 'All users', 'All users'],
                ['After install', 'Build custom agents', '9 agents ready', '12 cmds + 8 agents + 6 rules'],
              ].map(([label, ...cells], i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">{label}</td>
                  {cells.map((cell, j) => (
                    <td key={j} className="p-4 text-zinc-500 dark:text-zinc-400">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendation */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/60 dark:border-amber-800/60">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Recommendation</h4>
        <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <p><strong>Beginner:</strong> Starter Kit (Japanese, simple, 1 command)</p>
          <p><strong>Intermediate:</strong> Everything Claude Code (English, feature-rich)</p>
          <p><strong>Production:</strong> Agent SDK for custom apps</p>
          <p><strong>Best combo:</strong> Starter Kit + Agent SDK for production</p>
        </div>
      </div>
    </div>
  );
}

function CompareCard({
  color,
  tag,
  title,
  description,
  points,
}: {
  color: string;
  tag: string;
  title: string;
  description: string;
  points: string[];
}) {
  const colors: Record<string, { border: string; bg: string; tag: string; bullet: string }> = {
    indigo: { border: 'border-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', tag: 'bg-indigo-500', bullet: 'text-indigo-500' },
    purple: { border: 'border-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', tag: 'bg-purple-500', bullet: 'text-purple-500' },
    emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', tag: 'bg-emerald-500', bullet: 'text-emerald-500' },
  };
  const c = colors[color] ?? colors.indigo;

  return (
    <div className={`p-6 rounded-2xl border-2 ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${c.tag} text-white`}>{tag}</span>
      </div>
      <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>
      <div className="space-y-2 text-sm">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`${c.bullet} mt-0.5`}>-</span>
            <span className="text-zinc-700 dark:text-zinc-300">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
