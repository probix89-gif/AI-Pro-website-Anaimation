'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  BarChart3,
  GitBranch,
  Brain,
  Image as ImageIcon,
  Film,
  Palette,
  Search,
  Filter,
  ChevronDown,
  Plus,
  Star,
  Heart,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { Template, TemplateCategory } from '@/types';

interface TemplateBrowserProps {
  searchQuery: string;
}

const templateCategories: { id: TemplateCategory; label: string; icon: any; count: number }[] = [
  { id: 'presentation', label: 'Presentations', icon: LayoutDashboard, count: 12 },
  { id: 'social-media', label: 'Social Media', icon: Users, count: 8 },
  { id: 'marketing', label: 'Marketing', icon: BarChart3, count: 10 },
  { id: 'education', label: 'Education', icon: Brain, count: 6 },
  { id: 'diagram', label: 'Diagrams', icon: GitBranch, count: 15 },
  { id: 'chart', label: 'Charts', icon: BarChart3, count: 8 },
  { id: 'animation', label: 'Animations', icon: Film, count: 5 },
  { id: 'infographic', label: 'Infographics', icon: ImageIcon, count: 10 },
  { id: 'mindmap', label: 'Mind Maps', icon: Brain, count: 4 },
  { id: 'flowchart', label: 'Flowcharts', icon: GitBranch, count: 7 },
  { id: 'ui-design', label: 'UI Design', icon: Palette, count: 9 },
  { id: 'video', label: 'Video', icon: Film, count: 6 },
];

const mockTemplates: Template[] = [
  {
    id: 'tpl_1',
    name: 'Modern Pitch Deck',
    description: 'Clean and professional presentation template',
    category: 'presentation',
    thumbnail: '',
    tags: ['business', 'startup', 'investor'],
    canvasSize: { width: 1920, height: 1080 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_2',
    name: 'Instagram Story Pack',
    description: 'Animated stories for social media',
    category: 'social-media',
    thumbnail: '',
    tags: ['instagram', 'stories', 'animated'],
    canvasSize: { width: 1080, height: 1920 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_3',
    name: 'Data Dashboard',
    description: 'Interactive charts and metrics visualization',
    category: 'chart',
    thumbnail: '',
    tags: ['analytics', 'dashboard', 'charts'],
    canvasSize: { width: 1920, height: 1080 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_4',
    name: 'Flowchart Kit',
    description: 'Professional flowchart components',
    category: 'flowchart',
    thumbnail: '',
    tags: ['process', 'workflow', 'diagram'],
    canvasSize: { width: 1920, height: 1080 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_5',
    name: 'Mind Map Template',
    description: 'Brainstorming and idea organization',
    category: 'mindmap',
    thumbnail: '',
    tags: ['brainstorm', 'ideas', 'organization'],
    canvasSize: { width: 1920, height: 1080 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'tpl_6',
    name: 'Animated Logo Reveal',
    description: 'Dynamic logo animation with particles',
    category: 'animation',
    thumbnail: '',
    tags: ['logo', 'branding', 'particles'],
    canvasSize: { width: 1920, height: 1080 },
    elements: [],
    animations: [],
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function TemplateBrowser({ searchQuery }: TemplateBrowserProps) {
  const { templates: userTemplates, createProjectFromTemplate } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  const allTemplates = [...mockTemplates, ...userTemplates];

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.createdAt - a.createdAt;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleUseTemplate = (template: Template) => {
    createProjectFromTemplate(template.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Categories</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            className={cn(
              'px-2 py-1 text-xs rounded-full transition-colors',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            )}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              className={cn(
                'px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground'
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
              <span className="text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* View & Sort Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent'
            )}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent'
            )}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-2 py-1 text-xs bg-input border border-input rounded text-foreground"
        >
          <option value="popular">Popular</option>
          <option value="recent">Recent</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Templates Grid/List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {sortedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTemplates.map((template) => (
              <TemplateListItem
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {sortedTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
          <Sparkles className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="font-medium mb-2">No templates found</h3>
          <p className="text-sm max-w-xs">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const categoryInfo = templateCategories.find((c) => c.id === template.category);

  return (
    <div className="group relative bg-secondary border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {categoryInfo && categoryInfo.icon && (
              <categoryInfo.icon className="w-12 h-12 text-muted-foreground/50" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2">
          <button
            onClick={() => onUse(template)}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Use Template
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">{template.name}</h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{template.description}</p>
          </div>
          <button className="p-1 rounded hover:bg-accent transition-colors opacity-0 group-hover:opacity-100" title="Favorite">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">
              {tag}
            </span>
          ))}
          {categoryInfo && (
            <span className="ml-auto px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
              {categoryInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateListItem({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="w-16 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{template.name}</p>
        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
      </div>
      <button
        onClick={() => onUse(template)}
        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Use
      </button>
    </div>
  );
}

// Need to import List icon
function List({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}