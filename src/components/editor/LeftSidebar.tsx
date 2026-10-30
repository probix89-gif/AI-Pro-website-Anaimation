'use client';

import { useState, useRef } from 'react';
import {
  MousePointer2,
  Hand,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Diamond,
  ArrowRight,
  Pentagon,
  Minus,
  Image as ImageIcon,
  BarChart3,
  GitBranch,
  Brain,
  Upload,
  Plus,
  Sparkles,
  Layers,
  Layout,
  Search,
  Box,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';
import { AssetLibrary } from './AssetLibrary';
import { TemplateBrowser } from './TemplateBrowser';

interface LeftSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  onClose?: () => void;
}

export function LeftSidebar({ activeTab: externalTab, onTabChange, onClose }: LeftSidebarProps) {
  const {
    editor,
    setTool,
    addElement,
    currentProject,
    templates,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'tools' | 'shapes' | 'assets' | 'templates'>('tools');
  const [selectedShape, setSelectedShape] = useState<string>('rectangle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'select' as const, label: 'Select', shortcut: 'V', icon: MousePointer2 },
    { id: 'hand' as const, label: 'Pan Hand', shortcut: 'H', icon: Hand },
    { id: 'text' as const, label: 'Text', shortcut: 'T', icon: Type },
    { id: 'rectangle' as const, label: 'Rectangle', shortcut: 'R', icon: Square },
    { id: 'ellipse' as const, label: 'Circle', shortcut: 'O', icon: Circle },
    { id: 'line' as const, label: 'Line', shortcut: 'L', icon: Minus },
  ];

  const shapes = [
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'ellipse', label: 'Circle', icon: Circle },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'star', label: 'Star', icon: Star },
    { id: 'diamond', label: 'Diamond', icon: Diamond },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
    { id: 'polygon', label: 'Polygon', icon: Pentagon },
  ];

  // Helper to add element at canvas center
  const addQuickElement = (type: string, options: Record<string, any> = {}) => {
    if (!currentProject) return;

    const centerX = currentProject.canvasSize.width / 2;
    const centerY = currentProject.canvasSize.height / 2;
    const timestamp = Date.now();

    let element: CanvasElement;

    switch (type) {
      case 'heading': {
        element = {
          id: generateId('el'),
          type: 'text',
          name: 'Heading',
          content: 'New Heading',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: '700',
          lineHeight: 1.2,
          letterSpacing: -0.5,
          textAlign: 'left',
          verticalAlign: 'top',
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 2, y: 1 },
            opacity: 1,
          },
          style: { color: '#ffffff' },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      case 'paragraph': {
        element = {
          id: generateId('el'),
          type: 'text',
          name: 'Paragraph Text',
          content: 'Add your descriptive text here. Double click on the canvas to edit directly.',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: '400',
          lineHeight: 1.5,
          letterSpacing: 0,
          textAlign: 'left',
          verticalAlign: 'top',
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 2.5, y: 1.2 },
            opacity: 0.85,
          },
          style: { color: '#d1d5db' },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      case 'rectangle': {
        element = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Rectangle',
          cornerRadius: 12,
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 2.2, y: 1.6 },
            opacity: 1,
          },
          style: {
            fill: '#7c3aed',
            stroke: '#a78bfa',
            strokeWidth: 1.5,
          },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      case 'ellipse': {
        element = {
          id: generateId('el'),
          type: 'ellipse',
          name: 'Circle',
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 1.8, y: 1.8 },
            opacity: 1,
          },
          style: {
            fill: '#6366f1',
            stroke: '#c7d2fe',
            strokeWidth: 1.5,
          },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      case 'chart': {
        element = {
          id: generateId('el'),
          type: 'chart',
          name: 'Bar Chart',
          chartType: 'bar',
          data: {
            labels: ['Alpha', 'Beta', 'Gamma', 'Delta'],
            datasets: [
              {
                label: 'Performance',
                data: [35, 60, 45, 80],
                backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Chart Metrics' },
            },
          },
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 3.5, y: 2.5 },
            opacity: 1,
          },
          style: { stroke: '#8b5cf6', strokeWidth: 1 },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      case 'card': {
        element = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Modern Card',
          cornerRadius: 16,
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 3, y: 2 },
            opacity: 1,
          },
          style: {
            fill: '#151522',
            stroke: '#28283c',
            strokeWidth: 1,
            shadow: { color: 'rgba(0,0,0,0.4)', offsetX: 0, offsetY: 10, blur: 25 },
          },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;
        break;
      }

      default:
        return;
    }

    addElement(element);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProject) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const centerX = currentProject.canvasSize.width / 2;
        const centerY = currentProject.canvasSize.height / 2;
        const element: CanvasElement = {
          id: generateId('img'),
          type: 'image',
          name: file.name,
          src,
          naturalWidth: img.width,
          naturalHeight: img.height,
          fit: 'contain',
          transform: {
            position: { x: centerX, y: centerY },
            rotation: 0,
            scale: { x: 2.5, y: 2.5 },
            opacity: 1,
          },
          style: { borderRadius: 12 },
          locked: false,
          visible: true,
          zIndex: currentProject.elements.length + 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as CanvasElement;

        addElement(element);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c14] text-white select-none overflow-hidden">
      {/* Top Navigation Tabs: Tools, Shapes, Assets, Templates */}
      <div className="flex items-center border-b border-white/[0.08] p-1.5 gap-1 shrink-0 bg-[#0e0e16]">
        {[
          { id: 'tools' as const, label: 'Tools', icon: MousePointer2 },
          { id: 'shapes' as const, label: 'Shapes', icon: Square },
          { id: 'assets' as const, label: 'Assets', icon: Box },
          { id: 'templates' as const, label: 'Templates', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2 block">
                Active Tool
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left',
                      editor.tool === t.id
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] text-white/70 hover:text-white border border-white/[0.04]'
                    )}
                  >
                    <t.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t.label}</span>
                    <span className="ml-auto text-[10px] opacity-40 font-mono">{t.shortcut}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Insert Elements */}
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2 block">
                Quick Insert
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => addQuickElement('heading')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] text-xs font-medium text-white/80 hover:text-white transition-all text-left"
                >
                  <Type className="w-4 h-4 text-violet-400" />
                  <span>Heading Title</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-white/30" />
                </button>

                <button
                  onClick={() => addQuickElement('paragraph')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] text-xs font-medium text-white/80 hover:text-white transition-all text-left"
                >
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>Body Text Block</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-white/30" />
                </button>

                <button
                  onClick={() => addQuickElement('card')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] text-xs font-medium text-white/80 hover:text-white transition-all text-left"
                >
                  <Square className="w-4 h-4 text-indigo-400" />
                  <span>Modern Container Card</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-white/30" />
                </button>

                <button
                  onClick={() => addQuickElement('chart')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] text-xs font-medium text-white/80 hover:text-white transition-all text-left"
                >
                  <BarChart3 className="w-4 h-4 text-pink-400" />
                  <span>Data Chart Element</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-white/30" />
                </button>

                {/* Upload Image Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-xs font-medium text-violet-300 transition-all text-left"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image to Canvas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHAPES TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-1 block">
              Vector & Geometric Shapes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addQuickElement(s.id === 'ellipse' ? 'ellipse' : 'rectangle')}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-violet-600/15 border border-white/[0.05] hover:border-violet-500/30 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <s.icon className="w-6 h-6 text-white/60 group-hover:text-violet-400 transition-colors" />
                  <span className="text-[11px] font-medium text-white/70 group-hover:text-white">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border border-dashed border-white/10 hover:border-violet-500/40 text-center space-y-1.5 transition-colors cursor-pointer group"
            >
              <Upload className="w-5 h-5 mx-auto text-violet-400 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-medium text-white/80">Upload File or Image</p>
              <p className="text-[10px] text-white/40">PNG, JPG, SVG, WebP</p>
            </button>

            <div className="pt-2">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-2">
                Sample Media Assets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {['Linear Gradient Card', 'Purple Wave', 'Abstract Sphere', 'Grid Mesh'].map((item, i) => (
                  <button
                    key={item}
                    onClick={() => addQuickElement('card')}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 text-left transition-all group"
                  >
                    <div className="w-full h-14 rounded-lg bg-gradient-to-br from-violet-600/20 to-purple-800/20 border border-white/[0.04] mb-2 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-white/70 font-medium truncate block">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block">
              Curated Slide Templates
            </span>
            <div className="space-y-2">
              {[
                { name: 'Motion Keyframe Slide', category: 'Animation', elements: 4 },
                { name: 'SaaS Metric Dashboard', category: 'Infographic', elements: 5 },
                { name: 'Clean Architecture Diagram', category: 'Flowchart', elements: 6 },
              ].map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => addQuickElement('card')}
                  className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-violet-600/10 border border-white/[0.05] hover:border-violet-500/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90 group-hover:text-violet-300">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-1">
                    Adds preset elements to canvas
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}