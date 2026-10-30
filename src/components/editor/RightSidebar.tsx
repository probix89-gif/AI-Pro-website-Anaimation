'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Layers,
  Settings,
  Palette,
  Timeline,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Copy,
  Trash2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { PropertyPanel } from './PropertyPanel';
import { LayersPanel } from './LayersPanel';
import { AnimationPanel } from './AnimationPanel';
import { StylePanel } from './StylePanel';

interface RightSidebarProps {
  activeTab: 'properties' | 'layers' | 'animation' | 'style';
  onTabChange: (tab: 'properties' | 'layers' | 'animation' | 'style') => void;
  onClose?: () => void;
}

export function RightSidebar({ activeTab, onTabChange, onClose }: RightSidebarProps) {
  const { editor, currentProject } = useEditorStore();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'properties' as const, icon: Settings, label: 'Properties' },
    { id: 'layers' as const, icon: Layers, label: 'Layers', count: currentProject?.elements.length || 0 },
    { id: 'animation' as const, icon: Timeline, label: 'Animation' },
    { id: 'style' as const, icon: Palette, label: 'Style' },
  ];

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-semibold text-sm">Properties</h2>
        {onClose && (
          <button
            className="p-1 rounded hover:bg-accent transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'properties' && <PropertyPanel />}
        {activeTab === 'layers' && <LayersPanel onToggleSection={toggleSection} collapsedSections={collapsedSections} />}
        {activeTab === 'animation' && <AnimationPanel />}
        {activeTab === 'style' && <StylePanel />}
      </div>

      {/* Quick Actions */}
      {editor.selectedElements.length > 0 && (
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}