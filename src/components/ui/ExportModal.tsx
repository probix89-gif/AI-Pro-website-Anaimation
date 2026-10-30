'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  Download,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Code,
  Check,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { ColorPicker } from './ColorPicker';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const exportFormats = [
  { id: 'png', icon: ImageIcon, label: 'PNG Image', description: 'Raster image with transparency support', category: 'image' },
  { id: 'jpg', icon: ImageIcon, label: 'JPEG Image', description: 'Compressed raster image', category: 'image' },
  { id: 'webp', icon: ImageIcon, label: 'WebP Image', description: 'Modern web image format', category: 'image' },
  { id: 'svg', icon: ImageIcon, label: 'SVG Vector', description: 'Scalable vector graphics', category: 'vector' },
  { id: 'pdf', icon: FileText, label: 'PDF Document', description: 'Portable document format', category: 'document' },
  { id: 'mp4', icon: Film, label: 'MP4 Video', description: 'H.264 encoded video', category: 'video' },
  { id: 'gif', icon: Film, label: 'Animated GIF', description: 'Animated image format', category: 'video' },
  { id: 'mov', icon: Film, label: 'MOV Video', description: 'QuickTime video with alpha', category: 'video' },
  { id: 'json', icon: Code, label: 'JSON Project', description: 'Full project data export', category: 'data' },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { currentProject, exportProject } = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'mp4' | 'gif' | 'mov' | 'json'>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [includeAnimations, setIncludeAnimations] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isOpen) return null;

  const formatInfo = exportFormats.find((f) => f.id === selectedFormat);
  const isImageFormat = formatInfo?.category === 'image';
  const isVectorFormat = formatInfo?.category === 'vector';
  const isVideoFormat = formatInfo?.category === 'video';
  const isDocumentFormat = formatInfo?.category === 'document';
  const isDataFormat = formatInfo?.category === 'data';

  const handleExport = async () => {
    if (!currentProject) return;

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setExportProgress(0);
            onClose();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const options = {
        format: selectedFormat,
        quality: quality / 100,
        scale,
        transparent,
        includeAnimations,
        backgroundColor: transparent ? undefined : backgroundColor,
      };

      const blob = await exportProject(options);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '-')}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-secondary border border-border rounded-xl shadow-xl overflow-hidden animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Export Project</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    selectedFormat === format.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <format.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{format.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format-specific Options */}
          <div className="border-t border-border pt-4 space-y-4">
            {isImageFormat && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <span>Transparent Background</span>
                    <input
                      type="checkbox"
                      checked={transparent}
                      onChange={(e) => setTransparent(e.target.checked)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                  {!transparent && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Background Color</label>
                      <ColorPicker value={backgroundColor} onChange={setBackgroundColor} showAlpha={false} />
                    </div>
                  )}
                </div>
              </>
            )}

            {isVideoFormat && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <span>Include Animations</span>
                    <input
                      type="checkbox"
                      checked={includeAnimations}
                      onChange={(e) => setIncludeAnimations(e.target.checked)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center justify-between text-sm">
                      <span>Transparent Background (MOV only)</span>
                      <input
                        type="checkbox"
                        checked={transparent}
                        onChange={(e) => setTransparent(e.target.checked)}
                        disabled={selectedFormat !== 'mov'}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {(isImageFormat || isVideoFormat) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="flex items-center justify-between text-sm">
                    <span>Quality</span>
                    <span className="text-muted-foreground">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 appearance-none bg-muted rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center justify-between text-sm">
                    <span>Scale</span>
                    <span className="text-muted-foreground">{scale}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.25"
                    max="4"
                    step="0.25"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 appearance-none bg-muted rounded-lg"
                  />
                </div>
              </div>
            )}

            {isDocumentFormat && (
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Include Annotations</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Embed Fonts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                </label>
              </div>
            )}
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting {formatInfo?.label}...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button onClick={onClose} disabled={isExporting} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}