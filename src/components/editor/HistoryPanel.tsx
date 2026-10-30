'use client';

import { cn } from '@/lib/utils';
import { Clock, RotateCcw, Trash2, ChevronRight } from 'lucide-react';
import { useEditorStore } from '@/lib/store';

export function HistoryPanel() {
  const { editor, undo, redo, canUndo, canRedo } = useEditorStore();

  const historyItems = [
    ...editor.history.past.slice().reverse().map((action, index) => ({
      ...action,
      type: 'past' as const,
      index: editor.history.past.length - 1 - index,
    })),
    ...editor.history.future.map((action, index) => ({
      ...action,
      type: 'future' as const,
      index,
    })),
  ];

  const handleUndo = () => {
    if (canUndo()) undo();
  };

  const handleRedo = () => {
    if (canRedo()) redo();
  };

  const handleJumpTo = (index: number, type: 'past' | 'future') => {
    // Would implement jump to history state
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 p-2 bg-accent/50 rounded-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className={cn(
              'p-1.5 rounded transition-colors',
              canUndo() ? 'hover:bg-accent' : 'opacity-50 cursor-not-allowed'
            )}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className={cn(
              'p-1.5 rounded transition-colors',
              canRedo() ? 'hover:bg-accent' : 'opacity-50 cursor-not-allowed'
            )}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <RotateCcw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {editor.history.past.length} actions
        </span>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {editor.history.past.length === 0 && editor.history.future.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Clock className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No history yet</h3>
            <p className="text-sm max-w-xs">Your editing history will appear here.</p>
          </div>
        ) : (
          <>
            {editor.history.past.length > 0 && (
              <div className="px-2 pb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Past Actions
                </h4>
                {editor.history.past
                  .slice()
                  .reverse()
                  .map((action, index) => (
                    <HistoryItem
                      key={action.timestamp}
                      action={action}
                      index={editor.history.past.length - 1 - index}
                      isCurrent={index === 0}
                      onClick={handleJumpTo}
                    />
                  ))}
              </div>
            )}
            {editor.history.future.length > 0 && (
              <div className="px-2 pt-2 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Future Actions
                </h4>
                {editor.history.future.map((action, index) => (
                  <HistoryItem
                    key={action.timestamp}
                    action={action}
                    index={index}
                    isFuture={true}
                    onClick={handleJumpTo}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HistoryItem({
  action,
  index,
  isCurrent,
  isFuture,
  onClick,
}: {
  action: any;
  index: number;
  isCurrent?: boolean;
  isFuture?: boolean;
  onClick: (index: number, type: 'past' | 'future') => void;
}) {
  return (
    <button
      className={cn(
        'w-full text-left p-2 rounded-lg transition-colors group',
        isCurrent ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent',
        isFuture && 'opacity-60 text-muted-foreground'
      )}
      onClick={() => onClick(index, isFuture ? 'future' : 'past')}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono w-8">
          {isFuture ? '+' : ''}{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{action.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(action.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </div>
    </button>
  );
}