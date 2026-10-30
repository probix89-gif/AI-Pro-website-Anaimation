'use client';

import { useState } from 'react';
import { cn, generateId } from '@/lib/utils';
import {
  X,
  LayoutDashboard,
  Users,
  BarChart3,
  GitBranch,
  Brain,
  Film,
  Palette,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectTemplates = [
  { id: 'blank', name: 'Blank Canvas', description: 'Clean slate with full creative freedom', icon: LayoutDashboard },
  { id: 'presentation', name: 'Pitch Slide (16:9)', description: 'Keynote and presentation layout', icon: Film },
  { id: 'social-media', name: 'Social Story (9:16)', description: 'Instagram, TikTok, and mobile video', icon: Users },
  { id: 'infographic', name: 'Data Infographic', description: 'Metrics, statistical callouts & charts', icon: BarChart3 },
  { id: 'diagram', name: 'Process Flowchart', description: 'Architecture, logic, and workflow steps', icon: GitBranch },
  { id: 'mindmap', name: 'Concept Mind Map', description: 'Brainstorming hierarchy and nodes', icon: Brain },
  { id: 'ui-design', name: 'SaaS App Layout', description: 'Interface mockup and cards', icon: Palette },
];

interface PresetSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

const presetSizes: PresetSize[] = [
  { name: '1080p Full HD (1920×1080)', width: 1920, height: 1080, category: 'video' },
  { name: '4K Ultra HD (3840×2160)', width: 3840, height: 2160, category: 'video' },
  { name: 'Mobile Story (1080×1920)', width: 1080, height: 1920, category: 'social-media' },
  { name: 'Square Post (1080×1080)', width: 1080, height: 1080, category: 'social-media' },
  { name: 'Desktop Web (1440×900)', width: 1440, height: 900, category: 'ui-design' },
  { name: 'Infographic (1200×1600)', width: 1200, height: 1600, category: 'infographic' },
  { name: 'Custom Resolution', width: 0, height: 0, category: 'custom' },
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject, updateProject } = useEditorStore();
  const [step, setStep] = useState<'template' | 'settings'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number }>({ width: 1920, height: 1080 });
  const [projectName, setProjectName] = useState('');
  const [customWidth, setCustomWidth] = useState('1920');
  const [customHeight, setCustomHeight] = useState('1080');
  const [backgroundColor, setBackgroundColor] = useState('#0c0c14');

  if (!isOpen) return null;

  const handleCreate = () => {
    let width = selectedSize.width;
    let height = selectedSize.height;

    if (selectedSize.width === 0 && selectedSize.height === 0) {
      width = parseInt(customWidth) || 1920;
      height = parseInt(customHeight) || 1080;
    }

    const name = projectName.trim() || 'Untitled Project';
    const project = createProject(name, { width, height });

    // Seed preset elements based on template choice
    const timestamp = Date.now();
    let initialElements: CanvasElement[] = [];

    if (selectedTemplate === 'presentation') {
      initialElements = [
        {
          id: generateId('el'),
          type: 'text',
          name: 'Presentation Title',
          content: 'Modern Product Strategy',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: '700',
          lineHeight: 1.2,
          letterSpacing: -1,
          textAlign: 'center',
          verticalAlign: 'middle',
          transform: { position: { x: width / 2, y: height / 2 - 40 }, rotation: 0, scale: { x: 2.8, y: 1 }, opacity: 1 },
          style: { color: '#ffffff' },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement,
        {
          id: generateId('el'),
          type: 'text',
          name: 'Subtitle',
          content: 'Interactive motion graphics & visual deck',
          fontSize: 22,
          fontFamily: 'Inter',
          fontWeight: '400',
          lineHeight: 1.4,
          letterSpacing: 0,
          textAlign: 'center',
          verticalAlign: 'middle',
          transform: { position: { x: width / 2, y: height / 2 + 40 }, rotation: 0, scale: { x: 2.5, y: 1 }, opacity: 0.8 },
          style: { color: '#a78bfa' },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement,
      ];
    } else if (selectedTemplate === 'infographic') {
      initialElements = [
        {
          id: generateId('el'),
          type: 'chart',
          name: 'Key Growth Metrics',
          chartType: 'bar',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{ label: 'Users', data: [30, 55, 80, 110], backgroundColor: ['#8b5cf6', '#6366f1', '#a855f7', '#d946ef'] }],
          },
          options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Performance' } } },
          transform: { position: { x: width / 2, y: height / 2 }, rotation: 0, scale: { x: 3.5, y: 2.5 }, opacity: 1 },
          style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement,
      ];
    }

    updateProject({
      backgroundColor,
      elements: initialElements,
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate('blank');
    setSelectedSize({ width: 1920, height: 1080 });
    setProjectName('');
    setCustomWidth('1920');
    setCustomHeight('1080');
    setBackgroundColor('#0c0c14');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-[#0e0e16] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-2.5 bg-[#12121a] border-b border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => setStep('template')}
            className={cn('flex items-center gap-2 transition-colors', step === 'template' ? 'text-violet-400' : 'text-white/40')}
          >
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold', step === 'template' ? 'bg-violet-600 text-white' : 'bg-white/[0.08]')}>
              1
            </span>
            <span>Template Style</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 mx-3 text-white/20" />

          <button
            onClick={() => setStep('settings')}
            className={cn('flex items-center gap-2 transition-colors', step === 'settings' ? 'text-violet-400' : 'text-white/40')}
          >
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold', step === 'settings' ? 'bg-violet-600 text-white' : 'bg-white/[0.08]')}>
              2
            </span>
            <span>Canvas Settings</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'template' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {projectTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    if (t.id === 'social-media') setSelectedSize({ width: 1080, height: 1920 });
                    else if (t.id === 'ui-design') setSelectedSize({ width: 1440, height: 900 });
                    else if (t.id === 'infographic') setSelectedSize({ width: 1200, height: 1600 });
                    else setSelectedSize({ width: 1920, height: 1080 });
                  }}
                  className={cn(
                    'p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all relative group',
                    selectedTemplate === t.id
                      ? 'bg-violet-600/15 border-violet-500 shadow-md shadow-violet-600/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-violet-500/40 hover:bg-white/[0.04]'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-violet-400">
                    <t.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/90">{t.name}</h3>
                    <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">{t.description}</p>
                  </div>
                  {selectedTemplate === t.id && (
                    <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center absolute top-3 right-3 shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Q4 Strategy Animation"
                  className="w-full px-3 py-2 bg-[#14141f] border border-white/[0.08] rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-violet-500/60"
                />
              </div>

              {/* Dimensions */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Dimensions</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presetSizes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedSize({ width: preset.width, height: preset.height })}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all',
                        selectedSize.width === preset.width && selectedSize.height === preset.height
                          ? 'bg-violet-600/15 border-violet-500 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-white/60'
                      )}
                    >
                      <p className="text-[11px] font-semibold truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>

                {/* Custom dimensions inputs if selected */}
                {selectedSize.width === 0 && selectedSize.height === 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] text-white/40 block mb-1">Width (px)</span>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#14141f] border border-white/[0.08] rounded-lg text-xs font-mono text-white outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block mb-1">Height (px)</span>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#14141f] border border-white/[0.08] rounded-lg text-xs font-mono text-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Canvas Background</label>
                <div className="flex items-center gap-2">
                  {['#0c0c14', '#10101c', '#09090e', '#161b26', '#1e112a', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setBackgroundColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-transform',
                        backgroundColor === c ? 'border-violet-500 scale-110 shadow-md' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.08]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0c0c14]">
          {step === 'settings' ? (
            <button
              onClick={() => setStep('template')}
              className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 'template' ? (
            <button
              onClick={() => setStep('settings')}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/30"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-violet-600/30"
            >
              Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}