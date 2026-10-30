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
  MoreHorizontal,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Square,
  Circle,
  Type,
  Image,
  GitBranch,
  BarChart3,
  Brain,
  Film,
  Zap,
  Palette,
  Search,
  Filter,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';

interface LayersPanelProps {
  onToggleSection: (section: string) => void;
  collapsedSections: Set<string>;
}

export function LayersPanel({ onToggleSection, collapsedSections }: LayersPanelProps) {
  const { currentProject, editor, selectElement, updateElement, deleteElement, reorderElements } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Layers className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="font-medium mb-2">No project open</h3>
      </div>
    );
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-4 h-4" />;
      case 'ellipse':
        return <Circle className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'frame':
      case 'group':
        return <Layers className="w-4 h-4" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4" />;
      case 'diagram':
        return <GitBranch className="w-4 h-4" />;
      case 'mindmap':
        return <Brain className="w-4 h-4" />;
      case 'flowchart':
        return <GitBranch className="w-4 h-4" />;
      case 'animation':
        return <Zap className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const filteredElements = currentProject.elements
    .filter((el) => {
      const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || el.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => a.zIndex - b.zIndex);

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

  const handleVisibilityToggle = (element: CanvasElement) => {
    updateElement(element.id, { visible: !element.visible });
  };

  const handleLockToggle = (element: CanvasElement) => {
    updateElement(element.id, { locked: !element.locked });
  };

  const handleDuplicate = (element: CanvasElement) => {
    // Would need to implement duplicate in store
  };

  const handleDelete = (element: CanvasElement) => {
    deleteElement(element.id);
  };

  const renderLayerItem = (element: CanvasElement, depth = 0) => {
    const isSelected = editor.selectedElements.includes(element.id);
    const isDragOver = dragOverId === element.id;
    const hasChildren = element.type === 'group' || element.type === 'frame';
    const children = hasChildren && 'children' in element
      ? currentProject.elements.filter((el) => element.children.includes(el.id))
      : [];

    const isCollapsed = collapsedSections.has(`layer-${element.id}`);

    return (
      <div
        key={element.id}
        draggable={!element.locked}
        onDragStart={(e) => handleDragStart(e, element.id)}
        onDragOver={(e) => handleDragOver(e, element.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, element.id)}
        className={cn(
          'group relative rounded-lg transition-colors',
          isSelected && 'bg-primary/10 border border-primary/30',
          isDragOver && 'bg-primary/5 ring-1 ring-primary',
          element.locked && 'opacity-50',
          !element.visible && 'opacity-30'
        )}
      >
        <div
          className="flex items-center gap-1 px-2 py-1.5"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => selectElement(element.id)}
        >
          {/* Expand/Collapse for groups */}
          {hasChildren && children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSection(`layer-${element.id}`);
              }}
              className="p-0.5 rounded hover:bg-accent transition-colors flex-shrink-0"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {!hasChildren && <div className="w-6" />}

          {/* Visibility */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVisibilityToggle(element);
            }}
            className="p-1 rounded hover:bg-accent transition-colors flex-shrink-0"
            title={element.visible ? 'Hide' : 'Show'}
          >
            {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Lock */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLockToggle(element);
            }}
            className="p-1 rounded hover:bg-accent transition-colors flex-shrink-0"
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
          </button>

          {/* Icon */}
          <span className="w-6 h-6 flex items-center justify-center text-muted-foreground">
            {getElementIcon(element.type)}
          </span>

          {/* Name */}
          <span className="flex-1 text-sm truncate font-medium">
            {element.name}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(element);
              }}
              className="p-1 rounded hover:bg-accent transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(element);
              }}
              className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && children.length > 0 && !isCollapsed && (
          <div className="border-l border-border/50 ml-6">
            {children.map((child) => renderLayerItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const types = [
    'rectangle',
    'ellipse',
    'text',
    'image',
    'frame',
    'group',
    'chart',
    'diagram',
    'mindmap',
    'flowchart',
    'animation',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredElements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground p-8">
            <Filter className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No layers match your filter</p>
          </div>
        ) : (
          filteredElements
            .slice()
            .reverse()
            .map((element) => renderLayerItem(element))
        )}
      </div>

      {/* Add Layer Button */}
      <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
        <Layers className="w-4 h-4" />
        <span>Add Layer</span>
      </button>
    </div>
  );
}