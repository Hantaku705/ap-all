import { cn } from '../../lib/cn';

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
        color ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        className
      )}
    >
      {children}
    </span>
  );
}
