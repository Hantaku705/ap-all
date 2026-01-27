'use client';

import { CopyButton } from './CopyButton';

export function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  return (
    <div className="relative mt-4 rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950">
      {filename && (
        <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800 bg-zinc-900/80">
          {filename}
        </div>
      )}
      <div className="relative">
        <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
          <code className="text-zinc-100">{code}</code>
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  );
}
