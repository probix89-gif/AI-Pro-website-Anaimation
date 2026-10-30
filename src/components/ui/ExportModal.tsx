'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  Download,
  Image as ImageIcon,
  FileText,
  Film,
  Code,
  Check,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const exportFormats = [
  { id: 'png', icon: ImageIcon, label: 'PNG Image', description: 'Lossless raster image with transparency', category: 'image' },
  { id: 'jpg', icon: ImageIcon, label: 'JPEG Image', description: 'Standard compressed graphic', category: 'image' },
  { id: 'svg', icon: ImageIcon, label: 'SVG Vector', description: 'Scalable vector graphic', category: 'vector' },
  { id: 'mp4', icon: Film, label: 'MP4 Video', description: 'H.264 animated canvas export', category: 'video' },
  { id: 'json', icon: Code, label: 'Project JSON', description: 'Full canvas & element data schema', category: 'data' },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { currentProject, exportProject } = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'mp4' | 'gif' | 'mov' | 'json'>('png');
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isOpen || !currentProject) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(10);

    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 20;
      });
    }, 150);

    try {
      const options = {
        format: selectedFormat,
        quality: 0.95,
        scale,
        transparent,
        includeAnimations: true,
      };

      const blob = await exportProject(options as any);
      clearInterval(progressInterval);
      setExportProgress(100);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(currentProject.name || 'anitom-project').toLowerCase().replace(/\s+/g, '-')}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export failed:', err);
      clearInterval(progressInterval);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0e0e16] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold">Export Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Format Selection Grid */}
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2.5">
              Export Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24',
                    selectedFormat === format.id
                      ? 'bg-violet-600/15 border-violet-500 shadow-md shadow-violet-600/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-violet-500/40 hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <format.icon className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-white">{format.label}</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-snug line-clamp-2">
                    {format.description}
                  </p>
                  {selectedFormat === format.id && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Resolution Factor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
              Resolution Scale
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    scale === s
                      ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white'
                  )}
                >
                  {s}x ({currentProject.canvasSize.width * s} × {currentProject.canvasSize.height * s})
                </button>
              ))}
            </div>
          </div>

          {/* Transparency Option (for PNG/SVG) */}
          {(selectedFormat === 'png' || selectedFormat === 'svg') && (
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600"
              />
              <span>Transparent Background (remove canvas fill)</span>
            </label>
          )}

          {/* Progress bar when exporting */}
          {isExporting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Rendering frames and packaging...</span>
                <span className="font-mono">{exportProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-white/[0.08] flex items-center justify-end gap-3 shrink-0 bg-[#0c0c14]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}