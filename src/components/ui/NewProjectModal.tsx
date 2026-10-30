'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  LayoutDashboard,
  Users,
  BarChart3,
  GitBranch,
  Brain,
  Film,
  Palette,
  Image as ImageIcon,
  Video,
  Sparkles,
  Plus,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectTemplates = [
  { id: 'blank', name: 'Blank Project', description: 'Start from scratch', icon: LayoutDashboard, category: 'general' },
  { id: 'presentation', name: 'Presentation', description: 'Slides for meetings and pitches', icon: LayoutDashboard, category: 'presentation' },
  { id: 'social-media', name: 'Social Media Post', description: 'Instagram, Twitter, LinkedIn posts', icon: Users, category: 'social-media' },
  { id: 'video', name: 'Video Project', description: 'Animations and motion graphics', icon: Film, category: 'video' },
  { id: 'infographic', name: 'Infographic', description: 'Data visualization and charts', icon: BarChart3, category: 'infographic' },
  { id: 'diagram', name: 'Diagram', description: 'Flowcharts, mind maps, org charts', icon: GitBranch, category: 'diagram' },
  { id: 'mindmap', name: 'Mind Map', description: 'Brainstorming and idea mapping', icon: Brain, category: 'mindmap' },
  { id: 'ui-design', name: 'UI Design', description: 'Wireframes and mockups', icon: Palette, category: 'ui-design' },
];

interface PresetSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

const presetSizes: PresetSize[] = [
  { name: 'HD (1920×1080)', width: 1920, height: 1080, category: 'video' },
  { name: '4K (3840×2160)', width: 3840, height: 2160, category: 'video' },
  { name: 'Instagram Post (1080×1080)', width: 1080, height: 1080, category: 'social-media' },
  { name: 'Instagram Story (1080×1920)', width: 1080, height: 1920, category: 'social-media' },
  { name: 'Twitter Post (1200×675)', width: 1200, height: 675, category: 'social-media' },
  { name: 'LinkedIn Post (1200×627)', width: 1200, height: 627, category: 'social-media' },
  { name: 'Presentation 16:9 (1920×1080)', width: 1920, height: 1080, category: 'presentation' },
  { name: 'Presentation 4:3 (1024×768)', width: 1024, height: 768, category: 'presentation' },
  { name: 'Mobile Portrait (375×667)', width: 375, height: 667, category: 'ui-design' },
  { name: 'Desktop (1440×900)', width: 1440, height: 900, category: 'ui-design' },
  { name: 'Custom', width: 0, height: 0, category: 'custom' },
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject } = useEditorStore();
  const [step, setStep] = useState<'template' | 'settings'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number }>({ width: 1920, height: 1080 });
  const [projectName, setProjectName] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#0f0f1a');

  const handleCreate = () => {
    let width = selectedSize.width;
    let height = selectedSize.height;

    if (selectedSize.width === 0 && selectedSize.height === 0) {
      width = parseInt(customWidth) || 1920;
      height = parseInt(customHeight) || 1080;
    }

    const project = createProject(projectName || 'Untitled Project', { width, height });
    
    // Apply background color
    // Would need to update project background
    
    // If template selected, apply template
    if (selectedTemplate !== 'blank') {
      // Would apply template
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate('blank');
    setSelectedSize({ width: 1920, height: 1080 });
    setProjectName('');
    setCustomWidth('');
    setCustomHeight('');
    setBackgroundColor('#0f0f1a');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl h-[85vh] bg-secondary border border-border rounded-xl shadow-xl overflow-hidden animate-slide-in-bottom flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">New Project</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center px-4 py-2 border-b border-border">
          <div className={cn('flex items-center gap-2', step === 'template' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step === 'template' ? 'bg-primary text-primary-foreground' : 'bg-accent')}>
              1
            </div>
            <span className="font-medium">Template</span>
          </div>
          <div className="flex-1 h-px bg-border mx-4" />
          <div className={cn('flex items-center gap-2', step === 'settings' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-accent')}>
              2
            </div>
            <span className="font-medium">Settings</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'template' && <TemplateStep templates={projectTemplates} selected={selectedTemplate} onSelect={setSelectedTemplate} />}
          {step === 'settings' && (
            <SettingsStep
              sizes={presetSizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              customWidth={customWidth}
              onCustomWidthChange={setCustomWidth}
              customHeight={customHeight}
              onCustomHeightChange={setCustomHeight}
              projectName={projectName}
              onProjectNameChange={setProjectName}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          {step === 'settings' && (
            <button onClick={() => setStep('template')} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
              Back
            </button>
          )}
          {step === 'template' && (
            <button onClick={() => setStep('settings')} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
          {step === 'settings' && (
            <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Project <Check className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateStep({ templates, selected, onSelect }: { templates: typeof projectTemplates; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Choose a template to start with, or select Blank Project for a clean canvas.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all text-left group',
              selected === template.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
          >
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <template.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
            </div>
            <h4 className="font-medium text-sm mb-1">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>
            {selected === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SettingsStepProps {
  sizes: PresetSize[];
  selectedSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  customWidth: string;
  onCustomWidthChange: (value: string) => void;
  customHeight: string;
  onCustomHeightChange: (value: string) => void;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (value: string) => void;
}

function SettingsStep({
  sizes,
  selectedSize,
  onSizeChange,
  customWidth,
  onCustomWidthChange,
  customHeight,
  onCustomHeightChange,
  projectName,
  onProjectNameChange,
  backgroundColor,
  onBackgroundColorChange,
}: SettingsStepProps) {
  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Enter project name..."
          className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Canvas Size */}
      <div>
        <label className="block text-sm font-medium mb-2">Canvas Size</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
          {sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => onSizeChange({ width: size.width, height: size.height })}
              className={cn(
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedSize.width === size.width && selectedSize.height === size.height
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <p className="font-medium text-sm">{size.name}</p>
              {size.width > 0 && (
                <p className="text-xs text-muted-foreground">{size.width} × {size.height}</p>
              )}
            </button>
          ))}
        </div>

        {/* Custom Size Inputs */}
        {(selectedSize.width === 0 && selectedSize.height === 0) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Width (px)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => onCustomWidthChange(e.target.value)}
                placeholder="1920"
                min="100"
                max="8192"
                className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (px)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => onCustomHeightChange(e.target.value)}
                placeholder="1080"
                min="100"
                max="8192"
                className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-12 h-12 rounded-lg border border-border cursor-pointer"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-input border border-input rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="#RRGGBB"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-accent/50 rounded-lg border border-border">
        <h4 className="font-medium mb-3">Project Summary</h4>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium">{projectName || '(Untitled)'}</dd>
          <dt className="text-muted-foreground">Dimensions</dt>
          <dd className="font-medium">
            {selectedSize.width > 0 ? `${selectedSize.width} × ${selectedSize.height}` : `${customWidth || '1920'} × ${customHeight || '1080'}`}
          </dd>
          <dt className="text-muted-foreground">Background</dt>
          <dd className="font-medium flex items-center gap-2">
            <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', backgroundColor: backgroundColor, border: '1px solid var(--border)' }} />
            {backgroundColor}
          </dd>
        </dl>
      </div>
    </div>
  );
}