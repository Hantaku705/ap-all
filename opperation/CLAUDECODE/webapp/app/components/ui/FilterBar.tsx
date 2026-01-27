'use client';

import { cn } from '../../lib/cn';

export function FilterBar({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            value === opt.value
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
