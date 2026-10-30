'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Copy,
  Trash2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Square,
  Circle,
  Type,
  Image,
  Layers,
  GitBranch,
  BarChart3,
  Brain,
  Film,
  Palette,
  Zap,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';
import { ColorPicker } from '../ui/ColorPicker';

export function PropertyPanel() {
  const { editor, currentProject, updateElement, duplicateElement, deleteElement } = useEditorStore();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['transform', 'appearance', 'advanced']));

  const selectedElement = currentProject?.elements.find((el) => el.id === editor.selectedElements[0]);

  if (!selectedElement || editor.selectedElements.length !== 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        {editor.selectedElements.length === 0 ? (
          <>
            <Square className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No element selected</h3>
            <p className="text-sm max-w-xs">Select an element on the canvas to edit its properties.</p>
          </>
        ) : (
          <>
            <Layers className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Multiple elements selected</h3>
            <p className="text-sm max-w-xs">Select a single element to edit properties.</p>
          </>
        )}
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

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
        return <Layers className="w-4 h-4" />;
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { name: e.target.value });
  };

  const handleLockedChange = (locked: boolean) => {
    updateElement(selectedElement.id, { locked });
  };

  const handleVisibleChange = (visible: boolean) => {
    updateElement(selectedElement.id, { visible });
  };

  const handleDuplicate = () => {
    duplicateElement(selectedElement.id);
  };

  const handleDelete = () => {
    deleteElement(selectedElement.id);
  };

  return (
    <div className="space-y-4">
      {/* Element Header */}
      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          {getElementIcon(selectedElement.type)}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={selectedElement.name}
            onChange={handleNameChange}
            className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium"
          />
          <p className="text-xs text-muted-foreground capitalize">{selectedElement.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVisibleChange(!selectedElement.visible)}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title={selectedElement.visible ? 'Hide' : 'Show'}
            aria-label={selectedElement.visible ? 'Hide element' : 'Show element'}
          >
            {selectedElement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleLockedChange(!selectedElement.locked)}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title={selectedElement.locked ? 'Unlock' : 'Lock'}
            aria-label={selectedElement.locked ? 'Unlock element' : 'Lock element'}
          >
            {selectedElement.locked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Transform Section */}
      <PropertySection title="Transform" icon={<Sparkles className="w-4 h-4" />} collapsed={collapsedSections.has('transform')} onToggle={() => toggleSection('transform')}>
        <div className="grid grid-cols-2 gap-3">
          <PropertyInput
            label="X"
            value={selectedElement.transform.position.x.toFixed(1)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, position: { ...selectedElement.transform.position, x: parseFloat(v) } } })}
            type="number"
            step={0.1}
          />
          <PropertyInput
            label="Y"
            value={selectedElement.transform.position.y.toFixed(1)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, position: { ...selectedElement.transform.position, y: parseFloat(v) } } })}
            type="number"
            step={0.1}
          />
          <PropertyInput
            label="Width"
            value={(selectedElement.type === 'text' ? 200 : 100).toString()}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, scale: { ...selectedElement.transform.scale, x: parseFloat(v) / (selectedElement.type === 'text' ? 200 : 100) } } })}
            type="number"
            step={1}
          />
          <PropertyInput
            label="Height"
            value={(selectedElement.type === 'text' ? 50 : 100).toString()}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, scale: { ...selectedElement.transform.scale, y: parseFloat(v) / (selectedElement.type === 'text' ? 50 : 100) } } })}
            type="number"
            step={1}
          />
          <PropertyInput
            label="Rotation"
            value={selectedElement.transform.rotation.toFixed(1)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, rotation: parseFloat(v) } })}
            type="number"
            step={1}
            suffix="°"
          />
          <PropertyInput
            label="Opacity"
            value={(selectedElement.transform.opacity * 100).toFixed(0)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, opacity: Math.max(0, Math.min(1, parseFloat(v) / 100)) } })}
            type="range"
            min={0}
            max={100}
          />
          <PropertyInput
            label="Scale X"
            value={selectedElement.transform.scale.x.toFixed(2)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, scale: { ...selectedElement.transform.scale, x: parseFloat(v) } } })}
            type="number"
            step={0.01}
          />
          <PropertyInput
            label="Scale Y"
            value={selectedElement.transform.scale.y.toFixed(2)}
            onChange={(v: string) => updateElement(selectedElement.id, { transform: { ...selectedElement.transform, scale: { ...selectedElement.transform.scale, y: parseFloat(v) } } })}
            type="number"
            step={0.01}
          />
        </div>
      </PropertySection>

      {/* Appearance Section */}
      <PropertySection title="Appearance" icon={<Palette className="w-4 h-4" />} collapsed={collapsedSections.has('appearance')} onToggle={() => toggleSection('appearance')}>
        <div className="space-y-3">
          {selectedElement.type === 'text' ? (
            <>
              <PropertyInput
                label="Text Content"
                value={(selectedElement as any).content || ''}
                onChange={(v) => updateElement(selectedElement.id, { content: v })}
                type="text"
                multiline
              />
              <PropertySelect
                label="Font Family"
                value={(selectedElement as any).fontFamily || 'Inter'}
                options={[
                  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins',
                  'Nunito', 'Merriweather', 'Playfair Display', 'Source Sans Pro',
                  'Lato', 'Oswald', 'Raleway'
                ]}
                onChange={(v) => updateElement(selectedElement.id, { fontFamily: v })}
              />
              <PropertyInput
                label="Font Size"
                value={String((selectedElement as any).fontSize || 16)}
                onChange={(v: string) => updateElement(selectedElement.id, { fontSize: parseInt(v) })}
                type="number"
                min={8}
                max={200}
              />
              <PropertySelect
                label="Font Weight"
                value={(selectedElement as any).fontWeight || '400'}
                options={['100', '200', '300', '400', '500', '600', '700', '800', '900']}
                onChange={(v: string) => updateElement(selectedElement.id, { fontWeight: v })}
              />
              <PropertySelect
                label="Text Align"
                value={(selectedElement as any).textAlign || 'left'}
                options={['left', 'center', 'right']}
                onChange={(v: string) => updateElement(selectedElement.id, { textAlign: v as 'left' | 'center' | 'right' })}
              />
              <PropertySelect
                label="Vertical Align"
                value={(selectedElement as any).verticalAlign || 'top'}
                options={['top', 'middle', 'bottom']}
                onChange={(v: string) => updateElement(selectedElement.id, { verticalAlign: v as 'top' | 'middle' | 'bottom' })}
              />
              <PropertyInput
                label="Line Height"
                value={String((selectedElement as any).lineHeight || 1.5)}
                onChange={(v: string) => updateElement(selectedElement.id, { lineHeight: parseFloat(v) })}
                type="number"
                step={0.1}
                min={0.5}
                max={3}
              />
              <PropertyInput
                label="Letter Spacing"
                value={String((selectedElement as any).letterSpacing || 0)}
                onChange={(v: string) => updateElement(selectedElement.id, { letterSpacing: parseFloat(v) })}
                type="number"
                step={0.1}
                min={-5}
                max={20}
              />
            </>
          ) : selectedElement.type === 'rectangle' || selectedElement.type === 'ellipse' ? (
            <>
              <PropertyColorPicker
                label="Fill Color"
                value={selectedElement.style.fill || 'transparent'}
                onChange={(v) => updateElement(selectedElement.id, { style: { ...selectedElement.style, fill: v } })}
              />
              <PropertyInput
                label="Stroke Width"
                value={String(selectedElement.style.strokeWidth || 1)}
                onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, strokeWidth: parseFloat(v) } })}
                type="number"
                min={0}
                max={20}
                step={0.5}
              />
              {selectedElement.type === 'rectangle' && (
                <PropertyInput
                  label="Corner Radius"
                  value={String((selectedElement as any).cornerRadius || 0)}
                  onChange={(v: string) => updateElement(selectedElement.id, { cornerRadius: parseFloat(v) })}
                  type="number"
                  min={0}
                  max={100}
                />
              )}
            </>
          ) : selectedElement.type === 'image' ? (
            <>
              <PropertyInput
                label="Image URL"
                value={selectedElement.src}
                onChange={(v: string) => updateElement(selectedElement.id, { src: v })}
                type="url"
              />
              <PropertySelect
                label="Fit Mode"
                value={selectedElement.fit || 'contain'}
                options={['cover', 'contain', 'fill', 'none']}
                onChange={(v: string) => updateElement(selectedElement.id, { fit: v as 'cover' | 'contain' | 'fill' | 'none' })}
              />
            </>
          ) : (
            <>
              <PropertyColorPicker
                label="Fill Color"
                value={selectedElement.style.fill || 'transparent'}
                onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, fill: v } })}
              />
              <PropertyColorPicker
                label="Stroke Color"
                value={selectedElement.style.stroke || 'transparent'}
                onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, stroke: v } })}
              />
              <PropertyInput
                label="Stroke Width"
                value={String(selectedElement.style.strokeWidth || 1)}
                onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, strokeWidth: parseFloat(v) } })}
                type="number"
                min={0}
                max={20}
                step={0.5}
              />
            </>
          )}
        </div>
      </PropertySection>

      {/* Advanced Section */}
      <PropertySection title="Advanced" icon={<Settings className="w-4 h-4" />} collapsed={collapsedSections.has('advanced')} onToggle={() => toggleSection('advanced')}>
        <div className="space-y-3">
          <PropertyInput
            label="Z-Index"
            value={selectedElement.zIndex}
            onChange={(v) => updateElement(selectedElement.id, { zIndex: parseInt(v) })}
            type="number"
          />
          <PropertySelect
            label="Blend Mode"
            value={selectedElement.style.mixBlendMode || 'normal'}
            options={['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion']}
            onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, mixBlendMode: v } })}
          />
          <PropertyInput
            label="Filter (CSS)"
            value={selectedElement.style.filter || ''}
            onChange={(v: string) => updateElement(selectedElement.id, { style: { ...selectedElement.style, filter: v } })}
            type="text"
            placeholder="blur(5px) brightness(1.2)"
          />
        </div>
      </PropertySection>
    </div>
  );
}

function PropertySection({
  title,
  icon,
  children,
  collapsed,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
      </button>
      {!collapsed && <div className="p-3 border-t border-border">{children}</div>}
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
  suffix,
  multiline,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        {multiline ? (
          <textarea
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none min-h-[60px]"
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            step={step}
            min={min}
            max={max}
            className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder={placeholder}
          />
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function PropertySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
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
          className="w-8 h-8 rounded-lg border border-border cursor-pointer opacity-0 group-hover:opacity-100"
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