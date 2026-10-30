'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  History,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Plus,
  Search,
  FolderOpen,
  Star,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Bot,
  Layers,
  Timeline,
  Palette,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { TemplateCategory } from '@/types';
import { ProjectList } from './ProjectList';
import { TemplateBrowser } from './TemplateBrowser';
import { HistoryPanel } from './HistoryPanel';
import { AssetLibrary } from './AssetLibrary';

interface LeftSidebarProps {
  activeTab: 'projects' | 'templates' | 'history' | 'assets' | 'chat';
  onTabChange: (tab: 'projects' | 'templates' | 'history' | 'assets' | 'chat') => void;
  onClose?: () => void;
}

export function LeftSidebar({ activeTab, onTabChange, onClose }: LeftSidebarProps) {
  const { projects, templates, createProject } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'projects' as const, icon: LayoutDashboard, label: 'Projects', count: projects.length },
    { id: 'templates' as const, icon: Sparkles, label: 'Templates', count: templates.length },
    { id: 'history' as const, icon: History, label: 'History', count: 0 },
    { id: 'assets' as const, icon: ImageIcon, label: 'Assets', count: 0 },
    { id: 'chat' as const, icon: Bot, label: 'AI Chat', count: 0 },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-semibold text-sm">Sidebar</h2>
        {onClose && (
          <button
            className="p-1 rounded hover:bg-accent transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
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
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'projects' && <ProjectList searchQuery={searchQuery} />}
        {activeTab === 'templates' && <TemplateBrowser searchQuery={searchQuery} />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'assets' && <AssetLibrary searchQuery={searchQuery} />}
        {activeTab === 'chat' && <AIChatPlaceholder />}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          onClick={() => {
            createProject('Untitled Project');
            onTabChange('projects');
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>
    </div>
  );
}

function AIChatPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
      <Bot className="w-12 h-12 mb-4 opacity-50" />
      <h3 className="font-medium mb-2">AI Chat</h3>
      <p className="text-sm max-w-xs">Select the AI Chat tab from the top bar to start creating with AI.</p>
    </div>
  );
}