'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown-like rendering
  // For production, use a proper markdown library like react-markdown

  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block detection
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = '';
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeBlock key={i} code={codeBlockContent} language={codeBlockLang} />
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-semibold mt-3 mb-1">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>);
      }
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={i} className="ml-4">{line.slice(2)}</li>);
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(<li key={i} className="ml-4">{line.replace(/^\d+\.\s/, '')}</li>);
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-2">
            {line.slice(2)}
          </blockquote>
        );
      }
      // Horizontal rule
      else if (line === '---' || line === '***') {
        elements.push(<hr key={i} className="my-4 border-border" />);
      }
      // Paragraph
      else if (line.trim()) {
        // Process inline formatting
        const processed = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">$1</code>')
          .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" className="text-primary underline" target="_blank" rel="noopener">$1</a>');

        elements.push(
          <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }
      // Empty line
      else {
        elements.push(<div key={i} className="h-2" />);
      }
    }

    return elements;
  };

  return <div className="prose prose-invert max-w-none">{renderContent()}</div>;
}

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
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto"><code className="font-mono text-sm">{code}</code></pre>
    </div>
  );
}