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
  X,
  Plus,
  Check,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { Template, TemplateCategory } from '@/types';

interface TemplateBrowserProps {
  searchQuery?: string;
  onClose?: () => void;
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
    description: 'Clean and professional presentation slide template',
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
    description: 'Animated stories for social media promotion',
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
    name: 'SaaS Metric Dashboard',
    description: 'Interactive charts and KPI performance cards',
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
    name: 'Cloud Infrastructure Diagram',
    description: 'Connected system architecture & microservice flow',
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
    name: 'Strategy Mind Map',
    description: 'Brainstorming, concept hierarchy and product vision',
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
    name: 'Animated Motion Reveal',
    description: 'Keyframe transition sequence with glowing gradient',
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

export function TemplateBrowser({ searchQuery = '', onClose }: TemplateBrowserProps) {
  const { templates: userTemplates, createProjectFromTemplate, createProject } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState(searchQuery);

  const allTemplates = [...mockTemplates, ...userTemplates];

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    // If user template exists in store, use it, otherwise create project with template specs
    const proj = createProjectFromTemplate(template.id);
    if (!proj) {
      createProject(template.name, template.canvasSize);
    }
    if (onClose) onClose();
  };

  const content = (
    <div className="flex flex-col h-full space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
            activeCategory === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
          )}
        >
          All Categories
        </button>
        {templateCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
              activeCategory === cat.id
                ? 'bg-violet-600 text-white'
                : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
            )}
          >
            <cat.icon className="w-3 h-3" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map((template) => {
          const catInfo = templateCategories.find((c) => c.id === template.category);
          const Icon = catInfo?.icon || LayoutDashboard;

          return (
            <div
              key={template.id}
              className="group p-4 rounded-xl bg-[#12121a] border border-white/[0.06] hover:border-violet-500/40 hover:bg-[#151522] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-28 rounded-lg bg-gradient-to-br from-violet-950/40 via-purple-900/20 to-black border border-white/[0.04] mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                  <Icon className="w-8 h-8 text-violet-400/70 group-hover:text-violet-400 transition-colors" />
                </div>
                <h4 className="font-semibold text-xs text-white/90 group-hover:text-violet-200">
                  {template.name}
                </h4>
                <p className="text-[11px] text-white/40 mt-1 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-mono">
                  {template.canvasSize.width}×{template.canvasSize.height}
                </span>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl max-h-[85vh] bg-[#0e0e16] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Template Library</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{content}</div>
        </div>
      </div>
    );
  }

  return content;
}