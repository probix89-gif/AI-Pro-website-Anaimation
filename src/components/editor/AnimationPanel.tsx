'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  Key,
  Timeline,
  Zap,
  Settings,
  Minus,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { AnimationTrack, AnimationKeyframe, EasingType } from '@/types';

export function AnimationPanel() {
  const {
    currentProject,
    timeline,
    editor,
    setCurrentTime,
    setPlaying,
    setTimelineDuration,
    setTimelineFPS,
    addAnimationTrack,
    updateAnimationTrack,
    deleteAnimationTrack,
  } = useEditorStore();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showKeyframes, setShowKeyframes] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Timeline className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="font-medium mb-2">No project open</h3>
      </div>
    );
  }

  const selectedElement = currentProject.elements.find((el) => el.id === editor.selectedElements[0]);
  const elementTracks = currentProject.animations.filter((t) => selectedElement && t.elementId === selectedElement.id);
  const allTracks = currentProject.animations;

  const handleAddTrack = () => {
    if (!selectedElement) return;
    const newTrack: AnimationTrack = {
      id: `track_${Date.now()}`,
      elementId: selectedElement.id,
      property: 'transform.position.x',
      keyframes: [
        { time: 0, transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 }, opacity: 1 }, easing: 'ease-out' },
        { time: timeline.duration, transform: { position: { x: 100, y: 0 }, rotation: 0, scale: { x: 1, y: 1 }, opacity: 1 }, easing: 'ease-in' },
      ],
    };
    addAnimationTrack(newTrack);
    setSelectedTrackId(newTrack.id);
  };

  const handleKeyframeChange = (trackId: string, keyframeIndex: number, updates: Partial<AnimationKeyframe>) => {
    const track = allTracks.find((t) => t.id === trackId);
    if (!track) return;
    const newKeyframes = [...track.keyframes];
    newKeyframes[keyframeIndex] = { ...newKeyframes[keyframeIndex], ...updates };
    updateAnimationTrack(trackId, { keyframes: newKeyframes });
  };

  const handleAddKeyframe = (trackId: string) => {
    const track = allTracks.find((t) => t.id === trackId);
    if (!track) return;
    const newKeyframes = [
      ...track.keyframes,
      { time: timeline.currentTime, transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 }, opacity: 1 }, easing: 'ease-out' },
    ].sort((a, b) => a.time - b.time);
    updateAnimationTrack(trackId, { keyframes: newKeyframes });
  };

  const handleDeleteKeyframe = (trackId: string, keyframeIndex: number) => {
    const track = allTracks.find((t) => t.id === trackId);
    if (!track || track.keyframes.length <= 1) return;
    const newKeyframes = track.keyframes.filter((_, i) => i !== keyframeIndex);
    updateAnimationTrack(trackId, { keyframes: newKeyframes });
  };

  return (
    <div className="space-y-4">
      {/* Timeline Settings */}
      <div className="p-3 bg-accent/50 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Timeline Settings
          </h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PropertyInput
            label="Duration (s)"
            value={String(timeline.duration)}
            onChange={(v: string) => setTimelineDuration(parseFloat(v))}
            type="number"
            step={0.1}
            min={0.1}
            max={300}
          />
          <PropertyInput
            label="FPS"
            value={String(timeline.fps)}
            onChange={(v: string) => setTimelineFPS(parseInt(v))}
            type="number"
            min={1}
            max={120}
          />
          <PropertyInput
            label="Current Time"
            value={timeline.currentTime.toFixed(2)}
            onChange={(v: string) => setCurrentTime(parseFloat(v))}
            type="number"
            step={0.01}
            min={0}
            max={timeline.duration}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={timeline.loop}
              onChange={(e) => {
                // Would need setLoop in store
              }}
              className="rounded border-input"
            />
            Loop
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={timeline.playing}
              onChange={(e) => setPlaying(e.target.checked)}
              className="rounded border-input"
            />
            Auto-play
          </label>
        </div>
      </div>

      {/* Tracks for Selected Element */}
      {selectedElement && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Key className="w-4 h-4" />
              Tracks for "{selectedElement.name}"
            </h4>
            <button
              onClick={handleAddTrack}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Add Animation Track"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {elementTracks.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              <Key className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No animation tracks yet</p>
              <p className="text-xs mt-1">Click + to add your first animation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {elementTracks.map((track) => (
                <AnimationTrackItem
                  key={track.id}
                  track={track}
                  isSelected={selectedTrackId === track.id}
                  onSelect={setSelectedTrackId}
                  onAddKeyframe={() => handleAddKeyframe(track.id)}
                  onDelete={() => deleteAnimationTrack(track.id)}
                  timeline={timeline}
                  onKeyframeChange={handleKeyframeChange}
                  onDeleteKeyframe={handleDeleteKeyframe}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Tracks Overview */}
      {allTracks.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Timeline className="w-4 h-4" />
            All Tracks ({allTracks.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allTracks.map((track) => {
              const element = currentProject.elements.find((el) => el.id === track.elementId);
              return (
                <div
                  key={track.id}
                  className={cn(
                    'p-2 rounded-lg text-sm transition-colors cursor-pointer',
                    selectedTrackId === track.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent'
                  )}
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{element?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.property}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{track.keyframes.length} keyframes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AnimationTrackItem({
  track,
  isSelected,
  onSelect,
  onAddKeyframe,
  onDelete,
  timeline,
  onKeyframeChange,
  onDeleteKeyframe,
}: {
  track: AnimationTrack;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAddKeyframe: () => void;
  onDelete: () => void;
  timeline: any;
  onKeyframeChange: (trackId: string, index: number, updates: Partial<AnimationKeyframe>) => void;
  onDeleteKeyframe: (trackId: string, index: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden',
        isSelected && 'border-primary/50 bg-primary/5'
      )}
    >
      <button
        onClick={() => onSelect(track.id)}
        className="w-full flex items-center justify-between p-2 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm capitalize">{track.property.replace('.', ' ')}</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
            {track.keyframes.length} keyframes
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddKeyframe(); }}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="Add Keyframe at Current Time"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
            title="Delete Track"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </button>

      {expanded && (
        <div className="p-2 border-t border-border space-y-2">
          {track.keyframes.map((keyframe, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
              <span className="text-xs text-muted-foreground font-mono w-16">
                {keyframe.time.toFixed(2)}s
              </span>
              <div className="flex-1 space-y-1">
                <PropertyInput
                  label="Time"
                  value={keyframe.time.toFixed(2)}
                  onChange={(v: string) => onKeyframeChange(track.id, index, { time: parseFloat(v) })}
                  type="number"
                  step={0.01}
                  min={0}
                  max={timeline.duration}
                />
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <PropertyInput
                    label="X"
                    value={keyframe.transform.position.x.toFixed(1)}
                    onChange={(v: string) => onKeyframeChange(track.id, index, { transform: { ...keyframe.transform, position: { ...keyframe.transform.position, x: parseFloat(v) } } })}
                    type="number"
                    step={0.1}
                  />
                  <PropertyInput
                    label="Y"
                    value={keyframe.transform.position.y.toFixed(1)}
                    onChange={(v: string) => onKeyframeChange(track.id, index, { transform: { ...keyframe.transform, position: { ...keyframe.transform.position, y: parseFloat(v) } } })}
                    type="number"
                    step={0.1}
                  />
                  <PropertyInput
                    label="Rotation"
                    value={keyframe.transform.rotation.toFixed(1)}
                    onChange={(v: string) => onKeyframeChange(track.id, index, { transform: { ...keyframe.transform, rotation: parseFloat(v) } })}
                    type="number"
                    step={1}
                  />
                  <PropertyInput
                    label="Opacity"
                    value={(keyframe.transform.opacity * 100).toFixed(0)}
                    onChange={(v: string) => onKeyframeChange(track.id, index, { transform: { ...keyframe.transform, opacity: parseFloat(v) / 100 } })}
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <PropertySelect
                    label="Easing"
                    value={keyframe.easing || 'ease-out'}
                    options={['linear', 'ease-in', 'ease-out', 'ease-in-out', 'ease-in-sine', 'ease-out-sine', 'ease-in-out-sine', 'ease-in-cubic', 'ease-out-cubic', 'ease-in-out-cubic', 'ease-in-back', 'ease-out-back', 'ease-in-elastic', 'ease-out-elastic', 'ease-in-bounce', 'ease-out-bounce'] as EasingType[]}
                    onChange={(v) => onKeyframeChange(track.id, index, { easing: v })}
                  />
                  <button
                    onClick={() => onDeleteKeyframe(track.id, index)}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    title="Delete Keyframe"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min={min}
        max={max}
        className="w-full px-2 py-1 bg-input border border-input rounded text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
      />
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
  options: EasingType[];
  onChange: (value: EasingType) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EasingType)}
        className="w-full px-2 py-1 bg-input border border-input rounded text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
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

