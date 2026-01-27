import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import type { Example } from '../../data/onboarding-data';

export function ExampleCard({ example }: { example: Example }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <Badge>{example.category}</Badge>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{example.title}</span>
      </div>
      <div className="relative rounded-xl overflow-hidden">
        <div className="bg-zinc-900 dark:bg-zinc-950 p-4">
          <code className="text-sm text-zinc-100">{example.prompt}</code>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <CopyButton text={example.prompt} />
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{example.explanation}</p>
    </Card>
  );
}
