'use client';

import { useState } from 'react';
import { cn } from '../../lib/cn';

export function Accordion({
  title,
  children,
  defaultOpen,
  badge,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <div className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {badge}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{title}</span>
        </div>
        <svg
          className={cn('w-5 h-5 text-zinc-400 transition-transform duration-300', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-800 pt-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
