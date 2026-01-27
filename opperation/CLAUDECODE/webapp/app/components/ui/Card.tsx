import { cn } from '../../lib/cn';

export function Card({
  children,
  className,
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm',
        hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
