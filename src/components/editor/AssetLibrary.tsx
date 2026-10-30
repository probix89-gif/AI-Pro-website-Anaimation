'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Type,
  Upload,
  MoreHorizontal,
  Trash2,
  Download,
  Star,
  Grid,
  List,
  Filter,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';

interface AssetLibraryProps {
  searchQuery: string;
}

type AssetType = 'all' | 'images' | 'videos' | 'audio' | 'fonts' | 'documents';

const mockAssets = [
  { id: '1', name: 'background-gradient.png', type: 'images' as AssetType, size: '2.4 MB', url: '' },
  { id: '2', name: 'logo-animation.mp4', type: 'videos' as AssetType, size: '15.2 MB', url: '' },
  { id: '3', name: 'ambient-music.mp3', type: 'audio' as AssetType, size: '3.1 MB', url: '' },
  { id: '4', name: 'Inter-Regular.woff2', type: 'fonts' as AssetType, size: '156 KB', url: '' },
  { id: '5', name: 'presentation-template.pdf', type: 'documents' as AssetType, size: '890 KB', url: '' },
  { id: '6', name: 'texture-paper.jpg', type: 'images' as AssetType, size: '1.2 MB', url: '' },
  { id: '7', name: 'transition-swipe.mp4', type: 'videos' as AssetType, size: '5.6 MB', url: '' },
  { id: '8', name: 'sound-effect.wav', type: 'audio' as AssetType, size: '45 KB', url: '' },
];

export function AssetLibrary({ searchQuery }: AssetLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<AssetType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress(0);
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    e.target.value = '';
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'images':
        return <ImageIcon className="w-5 h-5 text-green-400" />;
      case 'videos':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'fonts':
        return <Type className="w-5 h-5 text-orange-400" />;
      case 'documents':
        return <FileText className="w-5 h-5 text-red-400" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: AssetType) => {
    switch (type) {
      case 'images':
        return 'bg-green-400/20 text-green-400';
      case 'videos':
        return 'bg-blue-400/20 text-blue-400';
      case 'audio':
        return 'bg-purple-400/20 text-purple-400';
      case 'fonts':
        return 'bg-orange-400/20 text-orange-400';
      case 'documents':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload Button */}
      <div className="mb-3">
        <label className="flex items-center gap-2 w-full p-2 bg-accent/50 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors group">
          <Upload className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm font-medium">Upload Assets</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.woff,.woff2,.ttf,.otf,.pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        {uploadProgress !== null && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {(['all', 'images', 'videos', 'audio', 'fonts', 'documents'] as AssetType[]).map((filter) => (
          <button
            key={filter}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full transition-colors whitespace-nowrap flex items-center gap-1',
              activeFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            )}
            onClick={() => setActiveFilter(filter)}
          >
            {filter !== 'all' && getTypeIcon(filter)}
            <span className="capitalize">{filter}</span>
          </button>
        ))}
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent')}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent')}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assets */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                typeIcon={getTypeIcon(asset.type)}
                typeColor={getTypeColor(asset.type)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAssets.map((asset) => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                typeIcon={getTypeIcon(asset.type)}
                typeColor={getTypeColor(asset.type)}
              />
            ))}
          </div>
        )}

        {filteredAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No assets found</h3>
            <p className="text-sm max-w-xs">Upload some assets or adjust your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({
  asset,
  typeIcon,
  typeColor,
}: {
  asset: any;
  typeIcon: React.ReactNode;
  typeColor: string;
}) {
  return (
    <div className="group relative bg-secondary border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-square flex items-center justify-center bg-muted">
        {typeIcon}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate mb-1">{asset.name}</p>
        <div className="flex items-center justify-between">
          <span className={cn('px-1.5 py-0.5 text-xs rounded', typeColor)}>
            {asset.type}
          </span>
          <span className="text-xs text-muted-foreground">{asset.size}</span>
        </div>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button className="p-1 rounded hover:bg-accent transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function AssetListItem({
  asset,
  typeIcon,
  typeColor,
}: {
  asset: any;
  typeIcon: React.ReactNode;
  typeColor: string;
}) {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
        {typeIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{asset.name}</p>
        <p className="text-xs text-muted-foreground">{asset.size} • {asset.type}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded hover:bg-accent transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}