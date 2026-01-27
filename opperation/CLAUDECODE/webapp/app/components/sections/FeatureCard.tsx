import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { categoryColors, categoryLabels, type Feature } from '../../data/onboarding-data';

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <Badge color={categoryColors[feature.category]}>
          {categoryLabels[feature.category]}
        </Badge>
        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {feature.name}
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
      {feature.usage && (
        <code className="mt-3 inline-block px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 font-mono">
          {feature.usage}
        </code>
      )}
    </Card>
  );
}
