'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Layers,
  Sliders,
  Palette,
  Film,
  X,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
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
  const { editor, currentProject, duplicateElement, deleteElement } = useEditorStore();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'properties' as const, icon: Sliders, label: 'Props' },
    { id: 'layers' as const, icon: Layers, label: 'Layers', count: currentProject?.elements.length || 0 },
    { id: 'animation' as const, icon: Film, label: 'Motion' },
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

  const selectedElement = currentProject?.elements.find(
    (el) => el.id === editor.selectedElements[0]
  );

  return (
    <div className="h-full flex flex-col bg-[#0c0c14] text-white select-none overflow-hidden border-l border-white/[0.07]">
      {/* Inspector Tab Bar */}
      <div className="flex items-center border-b border-white/[0.08] p-1.5 gap-1 shrink-0 bg-[#0e0e16]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="text-[11px]">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[9px] px-1 rounded-full bg-violet-500/20 text-violet-300 font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inspector Panel Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0">
        {activeTab === 'properties' && <PropertyPanel />}
        {activeTab === 'layers' && (
          <LayersPanel onToggleSection={toggleSection} collapsedSections={collapsedSections} />
        )}
        {activeTab === 'animation' && <AnimationPanel />}
        {activeTab === 'style' && <StylePanel />}
      </div>

      {/* Quick Element Actions Bar (at bottom when element selected) */}
      {selectedElement && (
        <div className="p-2.5 border-t border-white/[0.08] bg-[#0e0e16] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => duplicateElement(selectedElement.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-colors border border-white/[0.06]"
              title="Duplicate Element"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/20"
              title="Delete Element (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}