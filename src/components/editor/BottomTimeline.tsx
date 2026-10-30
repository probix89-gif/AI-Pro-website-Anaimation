'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Layers,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import type { AnimationTrack } from '@/types';

export function BottomTimeline() {
  const {
    timeline,
    currentProject,
    editor,
    setCurrentTime,
    setPlaying,
    setTimelineZoom,
    setTimelineLoop,
    animations,
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [showKeyframes, setShowKeyframes] = useState(false);

  const pixelsPerSecond = 100 * timeline.zoom;
  const totalWidth = timeline.duration * pixelsPerSecond;
  const playheadPosition = timeline.currentTime * pixelsPerSecond;

  const handleRulerClick = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(timeline.duration, time)));
  };

  const handlePlayheadDrag = (e: React.MouseEvent) => {
    if (!isDraggingPlayhead || !rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(timeline.duration, time)));
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handlePlayheadDrag(e as any);
    const handleMouseUp = () => setIsDraggingPlayhead(false);

    if (isDraggingPlayhead) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, pixelsPerSecond]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        setPlaying(!timeline.playing);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentTime(Math.max(0, timeline.currentTime - 1 / timeline.fps));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setCurrentTime(Math.min(timeline.duration, timeline.currentTime + 1 / timeline.fps));
        break;
      case 'Home':
        e.preventDefault();
        setCurrentTime(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentTime(timeline.duration);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timeline.playing, timeline.currentTime, timeline.fps, timeline.duration, setCurrentTime, setPlaying]);

  // Get tracks for selected element
  const selectedElement = currentProject?.elements.find((el) => el.id === editor.selectedElements[0]);
  const elementTracks = selectedElement ? animations.filter((t) => t.elementId === selectedElement.id) : [];

  return (
    <div className="flex flex-col h-[200px] bg-secondary border-t border-border">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-sm">Timeline</h3>
          <div className="flex items-center gap-1 border-l border-border pl-4">
            <button
              onClick={() => setCurrentTime(0)}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Go to Start (Home)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPlaying(!timeline.playing)}
              className="p-2 rounded hover:bg-accent transition-colors bg-primary/10"
              title={timeline.playing ? 'Pause (Space)' : 'Play (Space)'}
            >
              {timeline.playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCurrentTime(timeline.duration)}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Go to End (End)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-1 bg-input rounded-lg font-mono text-sm">
            <span className="text-foreground">{formatTime(timeline.currentTime, timeline.fps)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{formatTime(timeline.duration, timeline.fps)}</span>
          </div>

          {/* Loop Toggle */}
          <button
            onClick={() => setTimelineLoop(!timeline.loop)}
            className={cn(
              'p-1.5 rounded transition-colors',
              timeline.loop ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
            )}
            title="Loop Playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={timeline.zoom}
              onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
              className="w-32 h-2 appearance-none bg-muted rounded-lg"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {Math.round(timeline.zoom * 100)}%
            </span>
          </div>

          {/* Collapse/Expand */}
          <button className="p-1.5 rounded hover:bg-accent transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Ruler & Tracks */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Layer Names */}
        <div className="w-48 border-r border-border bg-secondary/50 flex-shrink-0 overflow-y-auto">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Layers
          </div>
          <div className="p-2 space-y-1">
            {elementTracks.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-8">
                No animation tracks for selected element
              </div>
            ) : (
              elementTracks.map((track) => (
                <div
                  key={track.id}
                  className="px-2 py-1.5 text-xs rounded bg-accent/50 border border-border flex items-center justify-between"
                >
                  <span className="truncate">{track.property}</span>
                  <span className="text-muted-foreground">{track.keyframes.length} keys</span>
                </div>
              ))
            )}
            <button className="w-full px-2 py-1.5 text-xs rounded border border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Add Track
            </button>
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 relative overflow-x-auto" ref={timelineRef}>
          {/* Ruler */}
          <div
            ref={rulerRef}
            className="absolute top-0 left-0 right-0 h-8 bg-secondary/50 border-b border-border z-10 flex items-end px-48"
            onClick={handleRulerClick}
            style={{ width: totalWidth + 200 }}
          >
            {Array.from({ length: Math.ceil(timeline.duration) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 w-px bg-border"
                style={{
                  left: i * pixelsPerSecond,
                  height: i % 5 === 0 ? '100%' : '50%',
                }}
              >
                {i % 5 === 0 && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap mb-1">
                    {formatTime(i, timeline.fps)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tracks Container */}
          <div className="pt-8 px-48" style={{ width: totalWidth + 200 }}>
            {elementTracks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Select an element and add animation tracks to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {elementTracks.map((track) => (
                  <AnimationTrackRow
                    key={track.id}
                    track={track}
                    pixelsPerSecond={pixelsPerSecond}
                    duration={timeline.duration}
                    currentTime={timeline.currentTime}
                    onKeyframeClick={(time) => setCurrentTime(time)}
                  />
                ))}
              </div>
            )}

            {/* Playhead */}
            <div
              className="absolute top-8 bottom-0 w-px timeline-playhead pointer-events-none z-20"
              style={{ left: playheadPosition }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap mb-1">
                {formatTime(timeline.currentTime, timeline.fps)}
              </div>
            </div>

            {/* Playhead Drag Handle */}
            <div
              className="absolute top-8 bottom-0 w-4 cursor-col-resize z-30"
              style={{ left: playheadPosition - 2 }}
              onMouseDown={handlePlayheadMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimationTrackRow({
  track,
  pixelsPerSecond,
  duration,
  currentTime,
  onKeyframeClick,
}: {
  track: AnimationTrack;
  pixelsPerSecond: number;
  duration: number;
  currentTime: number;
  onKeyframeClick: (time: number) => void;
}) {
  return (
    <div className="relative h-20 bg-accent/30 border border-border rounded-lg overflow-hidden">
      {/* Track Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

      {/* Keyframes */}
      {track.keyframes.map((keyframe, index) => (
        <button
          key={index}
          onClick={() => onKeyframeClick(keyframe.time)}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-primary transform hover:scale-125 transition-transform z-10"
          style={{
            left: keyframe.time * pixelsPerSecond - 1.5,
          }}
          title={`${keyframe.time.toFixed(2)}s`}
        >
          {index === 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-primary">▲</span>}
        </button>
      ))}

      {/* Track Label */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
        {track.property}
      </div>

      {/* Current Time Indicator on Track */}
      <div
        className="absolute top-0 bottom-0 w-px bg-primary/50 pointer-events-none"
        style={{ left: currentTime * pixelsPerSecond }}
      />
    </div>
  );
}