'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Trash2,
  Copy,
  Layers,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  GitBranch,
  BarChart3,
  Brain,
  Film,
  Zap,
  Search,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';

interface LayersPanelProps {
  onToggleSection?: (section: string) => void;
  collapsedSections?: Set<string>;
}

export function LayersPanel({ onToggleSection, collapsedSections }: LayersPanelProps) {
  const {
    currentProject,
    editor,
    selectElement,
    updateElement,
    deleteElement,
    reorderElements,
    duplicateElement,
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-white/30 p-8">
        <Layers className="w-10 h-10 mb-3 opacity-40 text-violet-400" />
        <h3 className="text-xs font-medium">No project open</h3>
      </div>
    );
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-3.5 h-3.5 text-violet-400" />;
      case 'ellipse':
        return <Circle className="w-3.5 h-3.5 text-purple-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'chart':
        return <BarChart3 className="w-3.5 h-3.5 text-pink-400" />;
      case 'diagram':
      case 'flowchart':
        return <GitBranch className="w-3.5 h-3.5 text-teal-400" />;
      case 'mindmap':
        return <Brain className="w-3.5 h-3.5 text-amber-400" />;
      case 'animation':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <Square className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  const filteredElements = currentProject.elements
    .filter((el) => {
      const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || el.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.zIndex - a.zIndex); // Display highest zIndex (top of canvas) first

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData('text/plain', elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(elementId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      const elements = [...currentProject.elements];
      const sourceIndex = elements.findIndex((el) => el.id === sourceId);
      const targetIndex = elements.findIndex((el) => el.id === targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = elements.splice(sourceIndex, 1);
        elements.splice(targetIndex, 0, removed);
        reorderElements(elements.map((el) => el.id));
      }
    }
    setDragOverId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="text"
          placeholder="Search layers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-[#14141f] border border-white/[0.06] rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredElements.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-xs">
            No layers found
          </div>
        ) : (
          filteredElements.map((element) => {
            const isSelected = editor.selectedElements.includes(element.id);
            const isDragOver = dragOverId === element.id;

            return (
              <div
                key={element.id}
                draggable={!element.locked}
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={(e) => handleDragOver(e, element.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, element.id)}
                onClick={() => selectElement(element.id)}
                className={cn(
                  'group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer',
                  isSelected
                    ? 'bg-violet-600/15 border-violet-500/40 text-violet-200'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] text-white/70 hover:text-white',
                  isDragOver ? 'ring-1 ring-violet-500' : '',
                  element.locked ? 'opacity-60' : '',
                  !element.visible ? 'opacity-30' : ''
                )}
              >
                {/* Element icon */}
                <span className="shrink-0">{getElementIcon(element.type)}</span>

                {/* Name */}
                <span className="flex-1 text-xs font-medium truncate">
                  {element.name}
                </span>

                {/* Action buttons: Visibility, Lock, Duplicate, Delete */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { visible: !element.visible });
                    }}
                    className="p-1 rounded hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors"
                    title={element.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { locked: !element.locked });
                    }}
                    className="p-1 rounded hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors"
                    title={element.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {element.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <LockOpen className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    className="p-1 rounded hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}