import { cn } from '../../lib/cn';

export function ProgressBar({
  percent,
  complete,
}: {
  percent: number;
  complete?: boolean;
}) {
  return (
    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          complete ? 'bg-green-500' : 'bg-indigo-500'
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
