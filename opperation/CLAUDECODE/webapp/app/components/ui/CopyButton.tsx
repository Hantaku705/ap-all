'use client';

import { useState } from 'react';

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-white/10 hover:bg-white/20 text-zinc-300'
      } ${className ?? ''}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
