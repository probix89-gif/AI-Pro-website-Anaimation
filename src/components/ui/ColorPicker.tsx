'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Copy, Check } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  showAlpha?: boolean;
  presetColors?: string[];
}

export function ColorPicker({
  label,
  value,
  onChange,
  showAlpha = true,
  presetColors = [
    '#ef4444', '#f97316', '#fbbf24', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#ffffff', '#f8f8f8', '#e4e4e7', '#a1a1aa', '#71717a', '#3f3f46', '#27272a', '#18181b',
  ],
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(100);
  const [inputValue, setInputValue] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse initial color
  useEffect(() => {
    const { h, s, l, a } = parseColor(value);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a * 100);
    setInputValue(value);
  }, [value]);

  const parseColor = (color: string) => {
    if (color === 'transparent') return { h: 0, s: 0, l: 0, a: 0 };

    // Handle hex
    if (color.startsWith('#')) {
      const hex = color.length === 4 ? color.slice(1).split('').map(c => c + c).join('') : color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return { ...rgbToHsl(r, g, b), a: 1 };
    }

    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]) / 255;
      const g = parseInt(rgbMatch[2]) / 255;
      const b = parseInt(rgbMatch[3]) / 255;
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
      return { ...rgbToHsl(r, g, b), a };
    }

    // Handle hsl/hsla
    const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
    if (hslMatch) {
      return {
        h: parseInt(hslMatch[1]),
        s: parseInt(hslMatch[2]),
        l: parseInt(hslMatch[3]),
        a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
      };
    }

    return { h: 0, s: 0, l: 50, a: 1 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return `#${f(0).toString(16).padStart(2, '0')}${f(8).toString(16).padStart(2, '0')}${f(4).toString(16).padStart(2, '0')}`;
  };

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    return [
      parseInt(cleanHex.slice(0, 2), 16),
      parseInt(cleanHex.slice(2, 4), 16),
      parseInt(cleanHex.slice(4, 6), 16),
    ];
  };

  const currentColor = hslToHex(hue, saturation, lightness);
  const rgbaColor = `rgba(${hexToRgb(currentColor).join(', ')}, ${alpha / 100})`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val === 'transparent') {
      onChange('transparent');
      return;
    }

    if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
      const { h, s, l } = parseColor(val);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      onChange(val);
    }
  };

  const handleHueChange = (h: number) => {
    setHue(h);
    const newColor = hslToHex(h, saturation, lightness);
    onChange(showAlpha ? `rgba(${hexToRgb(newColor).join(', ')}, ${alpha / 100})` : newColor);
  };

  const handleSaturationChange = (s: number) => {
    setSaturation(s);
    const newColor = hslToHex(hue, s, lightness);
    onChange(showAlpha ? `rgba(${hexToRgb(newColor).join(', ')}, ${alpha / 100})` : newColor);
  };

  const handleLightnessChange = (l: number) => {
    setLightness(l);
    const newColor = hslToHex(hue, saturation, l);
    onChange(showAlpha ? `rgba(${hexToRgb(newColor).join(', ')}, ${alpha / 100})` : newColor);
  };

  const handleAlphaChange = (a: number) => {
    setAlpha(a);
    onChange(`rgba(${hexToRgb(currentColor).join(', ')}, ${a / 100})`);
  };

  const handlePresetClick = (color: string) => {
    const { h, s, l, a } = parseColor(color);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a * 100);
    onChange(color);
    setInputValue(color);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-lg border border-border overflow-hidden transition-colors hover:border-primary/50"
        style={{ backgroundColor: value === 'transparent' ? 'transparent' : value }}
        aria-label="Color picker"
      >
        {value === 'transparent' && (
          <svg className="w-full h-full" viewBox="0 0 10 10">
            <rect width="10" height="10" fill="#888" />
            <rect width="5" height="5" fill="#aaa" />
            <rect x="5" y="5" width="5" height="5" fill="#aaa" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute right-0 top-full mt-2 z-50 w-72 bg-secondary border border-border rounded-xl shadow-xl p-4 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-sm">{label || 'Color Picker'}</span>
            <button onClick={handleClose} className="p-1 rounded hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Saturation/Lightness Picker */}
          <div className="relative mb-4" style={{ width: '100%', aspectRatio: '1' }}>
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: `linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`,
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-top from-black to-transparent" />
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
              }}
            />
            <div
              className="absolute inset-0 rounded-lg cursor-crosshair"
              onMouseDown={(e) => {
                const handleMove = (moveEvent: MouseEvent) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const s = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                  const l = Math.max(0, Math.min(100, 100 - ((moveEvent.clientY - rect.top) / rect.height) * 100));
                  handleSaturationChange(s);
                  handleLightnessChange(l);
                };
                const handleUp = () => {
                  window.removeEventListener('mousemove', handleMove);
                  window.removeEventListener('mouseup', handleUp);
                };
                window.addEventListener('mousemove', handleMove);
                window.addEventListener('mouseup', handleUp);
                handleMove(e as unknown as MouseEvent);
              }}
            />
          </div>

          {/* Hue Slider */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground w-16">Hue</span>
              <span className="text-xs text-muted-foreground">{hue}°</span>
            </div>
            <div
              className="relative h-4 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
              }}
              onMouseDown={(e) => {
                const handleMove = (moveEvent: MouseEvent) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const h = Math.max(0, Math.min(360, ((moveEvent.clientX - rect.left) / rect.width) * 360));
                  handleHueChange(h);
                };
                const handleUp = () => {
                  window.removeEventListener('mousemove', handleMove);
                  window.removeEventListener('mouseup', handleUp);
                };
                window.addEventListener('mousemove', handleMove);
                window.addEventListener('mouseup', handleUp);
                handleMove(e as unknown as MouseEvent);
              }}
            >
              <div
                className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${hue / 360 * 100}%` }}
              />
            </div>
          </div>

          {/* Alpha Slider */}
          {showAlpha && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground w-16">Alpha</span>
                <span className="text-xs text-muted-foreground">{alpha}%</span>
              </div>
              <div
                className="relative h-4 rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, transparent, ${currentColor})`,
                }}
                onMouseDown={(e) => {
                  const handleMove = (moveEvent: MouseEvent) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const a = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                    handleAlphaChange(a);
                  };
                  const handleUp = () => {
                    window.removeEventListener('mousemove', handleMove);
                    window.removeEventListener('mouseup', handleUp);
                  };
                  window.addEventListener('mousemove', handleMove);
                  window.addEventListener('mouseup', handleUp);
                  handleMove(e as unknown as MouseEvent);
                }}
              >
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${alpha}%` }}
                />
              </div>
            </div>
          )}

          {/* Color Input */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 bg-input border border-input rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="#RRGGBB"
            />
            <button
              onClick={() => navigator.clipboard.writeText(inputValue)}
              className="p-2 rounded hover:bg-accent transition-colors"
              title="Copy color value"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Colors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Presets</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handlePresetClick(color)}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all',
                    inputValue === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {inputValue === color && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Current Color Preview */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
            <div
              className="w-10 h-10 rounded-lg border border-border"
              style={{ background: `linear-gradient(to right, transparent, ${rgbaColor})` }}
            >
              <div className="w-full h-full rounded-lg" style={{ backgroundColor: rgbaColor }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="font-mono text-sm">{inputValue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}