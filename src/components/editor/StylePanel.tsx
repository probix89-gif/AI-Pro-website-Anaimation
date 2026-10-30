'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Droplet,
  Brush,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { ColorPicker } from '../ui/ColorPicker';

export function StylePanel() {
  const { currentProject, updateElement, editor } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'canvas' | 'theme' | 'presets'>('canvas');

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Palette className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="font-medium mb-2">No project open</h3>
      </div>
    );
  }

  const selectedElement = currentProject.elements.find((el) => el.id === editor.selectedElements[0]);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {[
          { id: 'canvas', icon: Palette, label: 'Canvas' },
          { id: 'theme', icon: Sun, label: 'Theme' },
          { id: 'presets', icon: Star, label: 'Presets' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'canvas' && (
          <CanvasStylePanel project={currentProject} selectedElement={selectedElement} />
        )}
        {activeTab === 'theme' && <ThemePanel />}
        {activeTab === 'presets' && <PresetsPanel />}
      </div>
    </div>
  );
}

function CanvasStylePanel({
  project,
  selectedElement,
}: {
  project: any;
  selectedElement: any;
}) {
  const handleBackgroundChange = (color: string) => {
    // Would need to update project background
  };

  return (
    <div className="space-y-4">
      {/* Canvas Background */}
      <PropertySection title="Canvas Background" icon={<Square className="w-4 h-4" />}>
        <div className="space-y-3">
          <PropertyColorPicker
            label="Background Color"
            value={project.backgroundColor}
            onChange={handleBackgroundChange}
          />
          <div className="grid grid-cols-5 gap-2">
            {['#0f0f1a', '#1a1a2e', '#16213e', '#0d1b2a', '#1b1b2f', '#2d1b4e', '#1a1a1a', '#000000', '#ffffff', '#f8f8f8'].map((color) => (
              <button
                key={color}
                onClick={() => handleBackgroundChange(color)}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-transform hover:scale-110',
                  project.backgroundColor === color ? 'border-primary scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </PropertySection>

      {/* Grid Settings */}
      <PropertySection title="Grid & Snapping" icon={<Square className="w-4 h-4" />}>
        <div className="space-y-3">
          <PropertyInput
            label="Grid Size"
            value={String(project.settings.gridSize)}
            onChange={(v: string) => {
              // Would need to update project settings
            }}
            type="number"
            min={5}
            max={100}
            step={5}
          />
          <PropertyCheckbox
            label="Show Grid"
            checked={project.settings.gridEnabled}
            onChange={(v) => {}}
          />
          <PropertyCheckbox
            label="Snap to Grid"
            checked={project.settings.snapToGrid}
            onChange={(v) => {}}
          />
          <PropertyCheckbox
            label="Snap to Objects"
            checked={project.settings.snapToObjects}
            onChange={(v) => {}}
          />
          <PropertyCheckbox
            label="Show Rulers"
            checked={project.settings.showRulers}
            onChange={(v) => {}}
          />
          <PropertyCheckbox
            label="Show Guides"
            checked={project.settings.showGuides}
            onChange={(v) => {}}
          />
        </div>
      </PropertySection>

      {/* Element Quick Styles */}
      {selectedElement && (
        <PropertySection title="Quick Styles" icon={<Brush className="w-4 h-4" />}>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {['rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'].map((radius) => (
                <button
                  key={radius}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded border transition-colors',
                    selectedElement.style.borderRadius === radius ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                  )}
                  onClick={() => {}}
                >
                  {radius.replace('rounded-', '')}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl'].map((shadow) => (
                <button
                  key={shadow}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded border transition-colors',
                    selectedElement.style.shadow === shadow ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                  )}
                  onClick={() => {}}
                >
                  {shadow.replace('shadow-', '')}
                </button>
              ))}
            </div>
          </div>
        </PropertySection>
      )}
    </div>
  );
}

function ThemePanel() {
  const { settings, updateSettings } = useEditorStore();

  return (
    <div className="space-y-4">
      <PropertySection title="Color Theme" icon={<Sun className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-2">
          {['dark', 'light', 'system'].map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ theme: theme as any })}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                settings.theme === theme ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {theme === 'dark' && <Moon className="w-6 h-6" />}
                {theme === 'light' && <Sun className="w-6 h-6" />}
                {theme === 'system' && <Monitor className="w-6 h-6" />}
              </div>
              <span className="text-sm font-medium capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </PropertySection>

      <PropertySection title="Accent Color" icon={<Droplet className="w-4 h-4" />}>
        <div className="grid grid-cols-6 gap-2">
          {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'].map((color) => (
            <button
              key={color}
              className={cn(
                'w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110',
                'border-transparent'
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </PropertySection>
    </div>
  );
}

function PresetsPanel() {
  return (
    <div className="space-y-4">
      <PropertySection title="Color Palettes" icon={<Palette className="w-4 h-4" />}>
        <div className="space-y-3">
          {[
            { name: 'Default', colors: ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#22c55e'] },
            { name: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'] },
            { name: 'Forest', colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'] },
            { name: 'Sunset', colors: ['#f97316', '#fb923c', '#fdba74', '#ffedd5', '#fff7ed', '#fffbeb'] },
            { name: 'Monochrome', colors: ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'] },
          ].map((palette) => (
            <div key={palette.name} className="p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{palette.name}</span>
                <button className="p-1 rounded hover:bg-accent transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1">
                {palette.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PropertySection>

      <PropertySection title="Typography Presets" icon={<Circle className="w-4 h-4" />}>
        <div className="space-y-2">
          {[
            'Modern Sans (Inter)',
            'Classic Serif (Merriweather)',
            'Geometric (Montserrat)',
            'Friendly (Nunito)',
            'Elegant (Playfair Display)',
            'Technical (JetBrains Mono)',
          ].map((preset) => (
            <button
              key={preset}
              className="w-full p-3 text-left rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <span className="font-medium text-sm">{preset}</span>
            </button>
          ))}
        </div>
      </PropertySection>
    </div>
  );
}

function PropertySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-accent/50 border-b border-border">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function PropertyColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <button
          className="relative w-10 h-10 rounded-lg border border-border overflow-hidden"
          style={{ backgroundColor: value === 'transparent' ? 'transparent' : value }}
        >
          {value === 'transparent' && (
            <svg className="w-full h-full" viewBox="0 0 10 10">
              <rect width="10" height="10" fill="#888" />
              <rect width="5" height="5" fill="#aaa" />
              <rect x="5" y="5" width="5" height="5" fill="#aaa" />
            </svg>
          )}
        </button>
        <input
          type="color"
          value={value === 'transparent' ? '#000000' : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value === 'transparent' ? 'transparent' : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono"
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
  type = 'text',
  step,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min={min}
        max={max}
        className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
    </div>
  );
}

function PropertyCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
      />
      <span>{label}</span>
    </label>
  );
}