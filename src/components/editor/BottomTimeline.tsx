'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn, formatTime } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Plus,
  Clock,
  Layers,
  Diamond,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { AnimationTrack, AnimationKeyframe } from '@/types';

export function BottomTimeline() {
  const {
    timeline,
    currentProject,
    editor,
    setCurrentTime,
    setPlaying,
    setTimelineZoom,
    setTimelineLoop,
    setTimelineDuration,
    selectElement,
    addAnimationTrack,
    updateAnimationTrack,
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Smooth playback loop
  useEffect(() => {
    if (timeline.playing) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const deltaSec = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        const nextTime = timeline.currentTime + deltaSec;
        if (nextTime >= timeline.duration) {
          if (timeline.loop) {
            setCurrentTime(0);
          } else {
            setCurrentTime(timeline.duration);
            setPlaying(false);
            return;
          }
        } else {
          setCurrentTime(nextTime);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [timeline.playing, timeline.currentTime, timeline.duration, timeline.loop, setCurrentTime, setPlaying]);

  const pixelsPerSecond = 80 * timeline.zoom;
  const totalWidth = Math.max(800, timeline.duration * pixelsPerSecond);
  const playheadPosition = timeline.currentTime * pixelsPerSecond;

  const handleRulerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(timeline.duration, clickX / pixelsPerSecond));
      setCurrentTime(newTime);
    },
    [timeline.duration, pixelsPerSecond, setCurrentTime]
  );

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPlayhead || !rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(timeline.duration, clickX / pixelsPerSecond));
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, timeline.duration, pixelsPerSecond, setCurrentTime]);

  const elements = currentProject?.elements || [];

  return (
    <div className="h-full w-full flex flex-col bg-[#0c0c14] select-none text-white overflow-hidden">
      {/* TIMELINE TOP BAR: Controls & Scrubbing Information */}
      <div className="h-9 px-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0e0e16]">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Go to Start (Home)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPlaying(!timeline.playing)}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all',
              timeline.playing
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.1]'
            )}
            title="Play/Pause (Space)"
          >
            {timeline.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{timeline.playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => setCurrentTime(timeline.duration)}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Go to End (End)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Loop playback toggle */}
          <button
            onClick={() => setTimelineLoop(!timeline.loop)}
            className={cn(
              'p-1 ml-1 rounded transition-colors',
              timeline.loop ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:text-white'
            )}
            title="Toggle Loop"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Time Readout */}
        <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-0.5 rounded bg-black/40 border border-white/[0.06]">
          <span className="text-violet-300">{formatTime(timeline.currentTime, timeline.fps)}</span>
          <span className="text-white/20">/</span>
          <span className="text-white/50">{formatTime(timeline.duration, timeline.fps)}</span>
        </div>

        {/* Right Duration & Zoom Settings */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-white/50">
            <span>Duration:</span>
            <input
              type="number"
              min={1}
              max={120}
              value={timeline.duration}
              onChange={(e) => setTimelineDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 px-1.5 py-0.5 bg-black/40 border border-white/[0.08] rounded text-white text-center font-mono text-xs outline-none"
            />
            <span>s</span>
          </div>

          <div className="flex items-center gap-1.5 text-white/40">
            <Zap className="w-3 h-3 text-violet-400" />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={timeline.zoom}
              onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
              className="w-16 h-1.5 appearance-none bg-white/[0.1] rounded-lg accent-violet-500"
              title="Timeline Scale"
            />
          </div>
        </div>
      </div>

      {/* TRACKS AREA: Left layer labels & Right scrollable timeline ruler */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Layer names column */}
        <div className="w-48 bg-[#0a0a12] border-r border-white/[0.08] overflow-y-auto shrink-0 flex flex-col">
          <div className="h-6 px-3 border-b border-white/[0.06] flex items-center bg-[#0d0d16] text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            <span>Layer Tracks ({elements.length})</span>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {elements.length === 0 ? (
              <div className="p-3 text-[11px] text-white/30 text-center">
                Canvas has no elements
              </div>
            ) : (
              elements.map((el) => {
                const isSelected = editor.selectedElements.includes(el.id);
                return (
                  <div
                    key={el.id}
                    onClick={() => selectElement(el.id)}
                    className={cn(
                      'h-8 px-3 flex items-center justify-between text-xs cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-violet-600/20 text-violet-200 border-l-2 border-violet-500'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                    )}
                  >
                    <span className="truncate font-medium">{el.name}</span>
                    <span className="text-[10px] font-mono opacity-40">{el.type}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Timeline Tracks & Ruler */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#09090e]"
        >
          {/* Time Ruler */}
          <div
            ref={rulerRef}
            onClick={handleRulerClick}
            className="h-6 border-b border-white/[0.08] bg-[#0c0c16] sticky top-0 z-20 cursor-pointer relative"
            style={{ width: `${totalWidth}px` }}
          >
            {Array.from({ length: Math.ceil(timeline.duration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-white/[0.1] pointer-events-none flex flex-col justify-end"
                style={{ left: `${sec * pixelsPerSecond}px` }}
              >
                <span className="text-[9px] font-mono text-white/40 pl-1 leading-none pb-1">
                  {sec}s
                </span>
              </div>
            ))}
          </div>

          {/* Track Rows corresponding to each element */}
          <div className="relative" style={{ width: `${totalWidth}px` }}>
            {elements.map((el) => {
              const isSelected = editor.selectedElements.includes(el.id);
              const track = currentProject?.animations?.find((a) => a.elementId === el.id);

              return (
                <div
                  key={el.id}
                  onClick={() => selectElement(el.id)}
                  className={cn(
                    'h-8 border-b border-white/[0.04] relative transition-colors cursor-pointer',
                    isSelected ? 'bg-violet-500/5' : 'hover:bg-white/[0.01]'
                  )}
                >
                  {/* Visual animation duration bar across timeline */}
                  <div
                    className="absolute top-1.5 bottom-1.5 rounded bg-violet-600/20 border border-violet-500/30 flex items-center px-2"
                    style={{
                      left: 0,
                      width: `${timeline.duration * pixelsPerSecond}px`,
                    }}
                  >
                    <span className="text-[10px] text-violet-300/60 font-mono truncate">
                      {el.name}
                    </span>
                  </div>

                  {/* Render Keyframes if any */}
                  {track?.keyframes?.map((kf, kfIdx) => (
                    <div
                      key={kfIdx}
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-400 rotate-45 rounded-xs border border-white shadow-sm z-10 hover:scale-125 transition-transform cursor-pointer"
                      style={{
                        left: `${kf.time * pixelsPerSecond - 6}px`,
                      }}
                      title={`Keyframe at ${kf.time.toFixed(2)}s`}
                    />
                  ))}
                </div>
              );
            })}

            {/* SCRUBBER PLAYHEAD */}
            <div
              className="absolute top-0 bottom-0 w-px bg-violet-500 z-30 pointer-events-none"
              style={{ left: `${playheadPosition}px` }}
            >
              <div
                onMouseDown={handlePlayheadMouseDown}
                className="w-3.5 h-3.5 bg-violet-500 rotate-45 rounded-xs border-2 border-[#09090d] shadow-lg absolute -top-1.5 -left-[7px] cursor-col-resize pointer-events-auto hover:scale-125 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}