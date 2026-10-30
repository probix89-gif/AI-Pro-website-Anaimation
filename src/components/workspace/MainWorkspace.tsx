'use client';

import { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  FolderOpen,
  Layout,
  Clock,
  ArrowRight,
  Wand2,
  Film,
  BarChart3,
  GitBranch,
  Brain,
  Palette,
  FileText,
  Zap,
  Settings,
  Paperclip,
  ChevronDown,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  History,
  Box,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { NewProjectModal } from '@/components/ui/NewProjectModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { TemplateBrowser } from '@/components/editor/TemplateBrowser';
import { generateId } from '@/lib/utils';
import type { Project, CanvasElement, Transform } from '@/types';

export function MainWorkspace() {
  const {
    projects,
    setCurrentProject,
    createProject,
    deleteProject,
    duplicateProject,
    addChatMessage,
    activeModelId,
    setActiveModel,
    aiProviders,
  } = useEditorStore();

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(activeModelId || 'nvidia/nemotron-3.5-bolt-e4b');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeNav, setActiveNav] = useState<'projects' | 'templates' | 'assets' | 'history' | 'settings'>('projects');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModels = [
    { id: 'nvidia/nemotron-3.5-bolt-e4b', name: 'NVIDIA Nemotron 3.5 Bolt', badge: 'Ultra-Fast' },
    { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', name: 'NVIDIA Nemotron 3.5 Lightning', badge: 'Reasoning' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (NVIDIA Hosted)', badge: 'Balanced' },
    { id: 'nvidia/nemotron-3.5-super-vl-120b-a12b', name: 'NVIDIA Nemotron 3.5 Super Vision', badge: 'Vision' },
  ];

  const quickPromptSuggestions = [
    { label: '✨ Animated Product Launch', prompt: 'Create an animated product launch presentation with purple glow gradient and stat callouts' },
    { label: '📊 Q4 SaaS Analytics Dashboard', prompt: 'Design a clean SaaS analytics infographic with bar charts, key metrics, and growth cards' },
    { label: '🔀 Cloud Auth Architecture Flow', prompt: 'Create an architecture diagram showing user authentication, JWT tokens, and microservices' },
    { label: '🧠 AI Strategy Mind Map', prompt: 'Generate an AI product roadmap mind map with 4 core strategic pillars' },
  ];

  // Quick creation templates with real canvas elements
  const handleQuickCreate = (type: 'animation' | 'infographic' | 'diagram' | 'mindmap' | 'uidesign' | 'template') => {
    const timestamp = Date.now();
    let newProject: Project;

    switch (type) {
      case 'animation': {
        newProject = createProject('Motion Animation', { width: 1920, height: 1080 });
        const card: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Hero Card',
          cornerRadius: 20,
          transform: {
            position: { x: 960, y: 540 },
            rotation: 0,
            scale: { x: 3, y: 2.2 },
            opacity: 1,
          },
          style: {
            fill: '#181826',
            stroke: '#8b5cf6',
            strokeWidth: 2,
            shadow: { color: 'rgba(139, 92, 246, 0.3)', offsetX: 0, offsetY: 10, blur: 30 },
          },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const title: CanvasElement = {
          id: generateId('el'),
          type: 'text',
          name: 'Motion Title',
          content: 'Animated Motion Studio',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: '700',
          lineHeight: 1.2,
          letterSpacing: -1,
          textAlign: 'center',
          verticalAlign: 'middle',
          transform: {
            position: { x: 960, y: 500 },
            rotation: 0,
            scale: { x: 2.5, y: 1 },
            opacity: 1,
          },
          style: {
            color: '#ffffff',
          },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const subtitle: CanvasElement = {
          id: generateId('el'),
          type: 'text',
          name: 'Motion Subtitle',
          content: 'Keyframe playback enabled on the bottom timeline',
          fontSize: 20,
          fontFamily: 'Inter',
          fontWeight: '400',
          lineHeight: 1.4,
          letterSpacing: 0,
          textAlign: 'center',
          verticalAlign: 'middle',
          transform: {
            position: { x: 960, y: 580 },
            rotation: 0,
            scale: { x: 2.5, y: 1 },
            opacity: 0.8,
          },
          style: {
            color: '#a78bfa',
          },
          locked: false,
          visible: true,
          zIndex: 3,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        useEditorStore.getState().updateProject({
          elements: [card, title, subtitle],
          backgroundColor: '#0c0c14',
        });
        break;
      }

      case 'infographic': {
        newProject = createProject('Metrics Infographic', { width: 1200, height: 1600 });
        const title: CanvasElement = {
          id: generateId('el'),
          type: 'text',
          name: 'Report Title',
          content: '2026 Performance Metrics',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: '700',
          lineHeight: 1.2,
          letterSpacing: -0.5,
          textAlign: 'center',
          verticalAlign: 'middle',
          transform: {
            position: { x: 600, y: 180 },
            rotation: 0,
            scale: { x: 2.8, y: 1 },
            opacity: 1,
          },
          style: { color: '#f4f4f6' },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const chartCard: CanvasElement = {
          id: generateId('el'),
          type: 'chart',
          name: 'Growth Bar Chart',
          chartType: 'bar',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
              {
                label: 'Revenue Growth',
                data: [42, 68, 85, 120],
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
              title: { display: true, text: 'Quarterly Acceleration' },
            },
          },
          transform: {
            position: { x: 600, y: 600 },
            rotation: 0,
            scale: { x: 4.5, y: 3 },
            opacity: 1,
          },
          style: { stroke: '#8b5cf6', strokeWidth: 1 },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        useEditorStore.getState().updateProject({
          elements: [title, chartCard],
          backgroundColor: '#0a0a10',
        });
        break;
      }

      case 'diagram': {
        newProject = createProject('System Architecture Diagram', { width: 1920, height: 1080 });
        const step1: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Client Node',
          cornerRadius: 12,
          transform: { position: { x: 450, y: 540 }, rotation: 0, scale: { x: 1.8, y: 1.2 }, opacity: 1 },
          style: { fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 2 },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const step2: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'API Gateway',
          cornerRadius: 12,
          transform: { position: { x: 960, y: 540 }, rotation: 0, scale: { x: 1.8, y: 1.2 }, opacity: 1 },
          style: { fill: '#2e1065', stroke: '#a855f7', strokeWidth: 2 },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const step3: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Database Cluster',
          cornerRadius: 12,
          transform: { position: { x: 1470, y: 540 }, rotation: 0, scale: { x: 1.8, y: 1.2 }, opacity: 1 },
          style: { fill: '#142a38', stroke: '#38bdf8', strokeWidth: 2 },
          locked: false,
          visible: true,
          zIndex: 3,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        useEditorStore.getState().updateProject({
          elements: [step1, step2, step3],
          backgroundColor: '#09090e',
        });
        break;
      }

      case 'mindmap': {
        newProject = createProject('Product Strategy Mind Map', { width: 1920, height: 1080 });
        const centerNode: CanvasElement = {
          id: generateId('el'),
          type: 'ellipse',
          name: 'Core Idea',
          transform: { position: { x: 960, y: 540 }, rotation: 0, scale: { x: 2.2, y: 1.6 }, opacity: 1 },
          style: { fill: '#7c3aed', stroke: '#c084fc', strokeWidth: 2 },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const branchA: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Market Research',
          cornerRadius: 16,
          transform: { position: { x: 620, y: 360 }, rotation: 0, scale: { x: 1.6, y: 1 }, opacity: 1 },
          style: { fill: '#1e1b4b', stroke: '#a5b4fc', strokeWidth: 1.5 },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const branchB: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Design System',
          cornerRadius: 16,
          transform: { position: { x: 1300, y: 360 }, rotation: 0, scale: { x: 1.6, y: 1 }, opacity: 1 },
          style: { fill: '#3b0764', stroke: '#f0abfc', strokeWidth: 1.5 },
          locked: false,
          visible: true,
          zIndex: 3,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        useEditorStore.getState().updateProject({
          elements: [centerNode, branchA, branchB],
          backgroundColor: '#09090d',
        });
        break;
      }

      case 'uidesign': {
        newProject = createProject('SaaS Dashboard Mockup', { width: 1440, height: 900 });
        const sidebar: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Sidebar Nav',
          cornerRadius: 0,
          transform: { position: { x: 120, y: 450 }, rotation: 0, scale: { x: 1.2, y: 4.5 }, opacity: 1 },
          style: { fill: '#11111a', stroke: '#222234', strokeWidth: 1 },
          locked: false,
          visible: true,
          zIndex: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        const mainCard: CanvasElement = {
          id: generateId('el'),
          type: 'rectangle',
          name: 'Metrics Card',
          cornerRadius: 16,
          transform: { position: { x: 800, y: 450 }, rotation: 0, scale: { x: 4.8, y: 3.2 }, opacity: 1 },
          style: { fill: '#141420', stroke: '#2d2d42', strokeWidth: 1 },
          locked: false,
          visible: true,
          zIndex: 2,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as CanvasElement;

        useEditorStore.getState().updateProject({
          elements: [sidebar, mainCard],
          backgroundColor: '#0c0c12',
        });
        break;
      }

      case 'template':
      default:
        setShowTemplatesModal(true);
        return;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const projectName = prompt.length > 40 ? `${prompt.slice(0, 37)}...` : prompt;
    const project = createProject(projectName, { width: 1920, height: 1080 });

    // Seed prompt into chat messages for contextual AI editing in the editor
    addChatMessage({
      id: generateId('msg'),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    });

    addChatMessage({
      id: generateId('msg'),
      role: 'assistant',
      content: `I've initialized your canvas for: **"${prompt}"** with the ${availableModels.find((m) => m.id === selectedModel)?.name || 'AI'} model.\n\nYou can use the right panel to adjust properties and keyframe animations, or ask me for contextual enhancements!`,
      timestamp: Date.now() + 10,
    });

    // Create visually appealing initial element
    const heroCard: CanvasElement = {
      id: generateId('el'),
      type: 'rectangle',
      name: 'AI Generated Container',
      cornerRadius: 16,
      transform: {
        position: { x: 960, y: 540 },
        rotation: 0,
        scale: { x: 3.6, y: 2.2 },
        opacity: 1,
      },
      style: {
        fill: '#151522',
        stroke: '#8b5cf6',
        strokeWidth: 2,
        shadow: { color: 'rgba(139, 92, 246, 0.25)', offsetX: 0, offsetY: 12, blur: 32 },
      },
      locked: false,
      visible: true,
      zIndex: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as CanvasElement;

    const heroText: CanvasElement = {
      id: generateId('el'),
      type: 'text',
      name: 'Prompt Title',
      content: prompt,
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: '600',
      lineHeight: 1.3,
      letterSpacing: -0.5,
      textAlign: 'center',
      verticalAlign: 'middle',
      transform: {
        position: { x: 960, y: 540 },
        rotation: 0,
        scale: { x: 2.8, y: 1 },
        opacity: 1,
      },
      style: { color: '#ffffff' },
      locked: false,
      visible: true,
      zIndex: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as CanvasElement;

    useEditorStore.getState().updateProject({
      elements: [heroCard, heroText],
      backgroundColor: '#09090e',
    });

    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((f) => f.name);
      setAttachedFiles((prev) => [...prev, ...names]);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#09090d] text-[#f4f4f7] overflow-hidden select-none">
      {/* LEFT SIDEBAR: Compact Icon Navigation */}
      <aside className="w-16 md:w-60 h-full bg-[#0d0d14] border-r border-white/[0.07] flex flex-col justify-between shrink-0 transition-all duration-300 z-30">
        <div className="flex flex-col">
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center px-4 border-b border-white/[0.07] gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Anitom AI
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-white/40 truncate">Creative Studio</span>
            </div>
          </div>

          {/* New Project Quick CTA in Sidebar */}
          <div className="p-3">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Create New Project"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Project</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            <button
              onClick={() => setActiveNav('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNav === 'projects'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Projects"
            >
              <FolderOpen className="w-4 h-4 shrink-0 text-violet-400" />
              <span className="hidden md:inline">Projects</span>
              <span className="hidden md:inline ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-white/50">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveNav('templates');
                setShowTemplatesModal(true);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNav === 'templates'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Templates"
            >
              <Layout className="w-4 h-4 shrink-0 text-purple-400" />
              <span className="hidden md:inline">Templates</span>
            </button>

            <button
              onClick={() => setActiveNav('assets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNav === 'assets'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Assets"
            >
              <Box className="w-4 h-4 shrink-0 text-indigo-400" />
              <span className="hidden md:inline">Assets</span>
            </button>

            <button
              onClick={() => setActiveNav('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNav === 'history'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="History"
            >
              <History className="w-4 h-4 shrink-0 text-pink-400" />
              <span className="hidden md:inline">History</span>
            </button>
          </nav>
        </div>

        {/* Bottom User / Settings section */}
        <div className="p-3 border-t border-white/[0.07] space-y-1">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            title="Settings & AI Providers"
          >
            <Settings className="w-4 h-4 shrink-0 text-white/50" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-white/90 font-medium truncate">Studio Workspace</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Model
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none animate-violet-glow" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none animate-violet-glow" />

        {/* Top Header */}
        <header className="h-16 px-6 border-b border-white/[0.06] flex items-center justify-between shrink-0 z-10 backdrop-blur-sm bg-[#09090d]/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Studio Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="px-3.5 py-1.5 text-xs text-white/70 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            >
              <Layout className="w-3.5 h-3.5" />
              Templates
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Central Workspace Scrollable Area */}
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-12 z-10">
          {/* Hero Welcome Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Visual & Motion Intelligence
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              What would you like to create?
            </h1>
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto">
              Transform your thoughts into professional animations, infographics, diagrams, and UI mockups.
            </p>
          </div>

          {/* CHATGPT-INSPIRED AI PROMPT INPUT CONTAINER */}
          <div className="w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-indigo-600/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative bg-[#11111a] border border-white/[0.1] group-hover:border-violet-500/50 rounded-2xl p-4 shadow-2xl transition-all">
              {/* Natural-language input */}
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-violet-400 mt-2 shrink-0" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  rows={3}
                  placeholder="Describe your design, animation, diagram, or infographic in natural language... (e.g. 'Create an animated customer journey with 4 stages and glowing purple highlights')"
                  className="w-full bg-transparent text-sm md:text-base text-white placeholder-white/30 outline-none resize-none min-h-[72px]"
                />
              </div>

              {/* Attachments preview */}
              {attachedFiles.length > 0 && (
                <div className="flex items-center gap-2 my-2 flex-wrap">
                  {attachedFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/70"
                    >
                      <Paperclip className="w-3 h-3 text-violet-400" />
                      {file}
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-white/40 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Action Bar: Model selector, attachment, generate */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Model Selector Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setActiveModel(e.target.value);
                      }}
                      className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white/80 rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer transition-colors"
                    >
                      {availableModels.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#12121c] text-white">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Attachment Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-white/50 hover:text-white/90 rounded-lg hover:bg-white/[0.05] transition-colors"
                    title="Attach reference file or image"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              {quickPromptSuggestions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setPrompt(item.prompt)}
                  className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-white/60 hover:text-white transition-all whitespace-nowrap shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK CREATION OPTIONS: 6 Interactive Studio Tools */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Quick Creation Studio
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  id: 'animation' as const,
                  label: 'Animation',
                  desc: 'Keyframe motion graphics',
                  icon: Film,
                  color: 'from-purple-500 to-pink-500',
                  border: 'group-hover:border-purple-500/40',
                },
                {
                  id: 'infographic' as const,
                  label: 'Infographic',
                  desc: 'Data visualization & stats',
                  icon: BarChart3,
                  color: 'from-blue-500 to-cyan-500',
                  border: 'group-hover:border-blue-500/40',
                },
                {
                  id: 'diagram' as const,
                  label: 'Diagram',
                  desc: 'Flow & architecture charts',
                  icon: GitBranch,
                  color: 'from-emerald-500 to-teal-500',
                  border: 'group-hover:border-emerald-500/40',
                },
                {
                  id: 'mindmap' as const,
                  label: 'Mind Map',
                  desc: 'Ideation & concept mapping',
                  icon: Brain,
                  color: 'from-amber-500 to-orange-500',
                  border: 'group-hover:border-amber-500/40',
                },
                {
                  id: 'uidesign' as const,
                  label: 'UI Design',
                  desc: 'Web & mobile app mockups',
                  icon: Palette,
                  color: 'from-violet-500 to-indigo-500',
                  border: 'group-hover:border-violet-500/40',
                },
                {
                  id: 'template' as const,
                  label: 'Templates',
                  desc: 'Curated design systems',
                  icon: Layout,
                  color: 'from-rose-500 to-pink-500',
                  border: 'group-hover:border-rose-500/40',
                },
              ].map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleQuickCreate(card.id)}
                  className={`group relative p-4 rounded-xl bg-[#111119] border border-white/[0.06] ${card.border} hover:bg-[#141422] transition-all duration-200 text-left flex flex-col justify-between h-36`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/90 group-hover:text-white">
                      {card.label}
                    </h3>
                    <p className="text-[11px] text-white/40 leading-snug mt-0.5 line-clamp-2">
                      {card.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* RECENT PROJECTS SECTION */}
          <section className="space-y-4 pb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Recent Projects ({projects.length})
              </h2>

              <button
                onClick={() => setShowNewProjectModal(true)}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Blank Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111119] border border-dashed border-white/[0.08] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-white/80">No projects yet</h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto">
                  Start by typing an AI prompt above, selecting a quick creation category, or creating a custom project.
                </p>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group relative p-4 rounded-xl bg-[#111119] border border-white/[0.06] hover:border-violet-500/30 hover:bg-[#141420] transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => setCurrentProject(proj)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/[0.08]"
                          style={{ backgroundColor: proj.backgroundColor || '#151522' }}
                        >
                          <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white/90 group-hover:text-violet-300 transition-colors truncate">
                            {proj.name}
                          </h3>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {proj.canvasSize?.width || 1920} × {proj.canvasSize?.height || 1080} • {proj.elements?.length || 0} elements
                          </p>
                        </div>
                      </div>

                      {/* Card actions: Duplicate, Delete */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateProject(proj.id);
                          }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(proj.id);
                          }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/30">
                      <span>Updated {new Date(proj.updatedAt).toLocaleDateString()}</span>
                      <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                        Open Editor
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODALS */}
      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}

      {showTemplatesModal && (
        <TemplateBrowser
          searchQuery=""
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
