'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg bg-muted border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-accent/50">
        <span className="text-xs text-muted-foreground font-mono">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-background transition-colors text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            'Copy'
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto"><code className="font-mono text-sm">{code}</code></pre>
    </div>
  );
}