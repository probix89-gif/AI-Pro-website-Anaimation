import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  CanvasElement,
  Project,
  Template,
  AIProvider,
  AIModel,
  ChatMessage,
  EditorState,
  EditorTool,
  TimelineState,
  UserSettings,
  Vector2D,
  Size,
  Transform,
  AnimationTrack,
  ExportOptions,
} from '@/types';
import { generateId, deepClone, clamp } from '@/lib/utils';

interface EditorStore {
  // Project state
  currentProject: Project | null;
  projects: Project[];
  templates: Template[];
  
  // Editor state
  editor: EditorState;
  
  // Timeline state
  timeline: TimelineState;
  animations: AnimationTrack[];
  
  // AI state
  aiProviders: AIProvider[];
  activeProviderId: string;
  activeModelId: string;
  chatMessages: ChatMessage[];
  isAILoading: boolean;
  
  // User settings
  settings: UserSettings;
  
  // UI state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  bottomTimelineOpen: boolean;
  activeLeftTab: 'projects' | 'templates' | 'history' | 'assets' | 'chat';
  activeRightTab: 'properties' | 'layers' | 'animation' | 'style';
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, size?: Size) => Project;
  updateProject: (updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  saveProject: () => void;
  
  // Element actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElement: (id: string) => CanvasElement | null;
  selectElement: (id: string, multi?: boolean) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  setHoveredElement: (id: string | null) => void;
  reorderElements: (ids: string[]) => void;
  groupElements: (ids: string[]) => CanvasElement | null;
  ungroupElement: (id: string) => CanvasElement[];
  alignElements: (ids: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (ids: string[], direction: 'horizontal' | 'vertical') => void;
  
  // Transform actions
  setElementTransform: (id: string, transform: Partial<Transform>) => void;
  setElementStyle: (id: string, style: Partial<CanvasElement['style']>) => void;
  setElementProperty: <K extends keyof CanvasElement>(id: string, key: K, value: CanvasElement[K]) => void;
  
  // Editor tool actions
  setTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Vector2D) => void;
  setPanDelta: (delta: Vector2D) => void;
  resetViewport: () => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  
  // History actions
  pushHistory: (action: EditorState['history']['past'][0]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Clipboard
  copyElements: (ids: string[]) => void;
  pasteElements: (position?: Vector2D) => CanvasElement[];
  cutElements: (ids: string[]) => CanvasElement[];
  
  // Timeline actions
  setTimelineDuration: (duration: number) => void;
  setTimelineFPS: (fps: number) => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setTimelineLoop: (loop: boolean) => void;
  setTimelineZoom: (zoom: number) => void;
  addAnimationTrack: (track: AnimationTrack) => void;
  updateAnimationTrack: (id: string, updates: Partial<AnimationTrack>) => void;
  deleteAnimationTrack: (id: string) => void;
  
  // Template actions
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  createProjectFromTemplate: (templateId: string) => Project | null;
  
  // AI actions
  addAIProvider: (provider: AIProvider) => void;
  updateAIProvider: (id: string, updates: Partial<AIProvider>) => void;
  deleteAIProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
  setActiveModel: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteChatMessage: (id: string) => void;
  clearChatHistory: () => void;
  setAILoading: (loading: boolean) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  
  // UI actions
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomTimeline: () => void;
  setActiveLeftTab: (tab: EditorStore['activeLeftTab']) => void;
  setActiveRightTab: (tab: EditorStore['activeRightTab']) => void;
  
  // Export
  exportProject: (options: ExportOptions) => Promise<Blob>;
  
  // Import
  importProject: (data: string) => Project | null;
}

const defaultSettings: UserSettings = {
  aiProviders: [
    {
      id: 'nvidia',
      name: 'NVIDIA',
      type: 'nvidia',
      models: [
        {
          id: 'nvidia/nemotron-3-5-super',
          name: 'Nemotron 3.5 Super',
          provider: 'nvidia',
          maxTokens: 8192,
          supportsVision: false,
          supportsFunctions: true,
        },
      ],
      defaultModel: 'nvidia/nemotron-3-5-super',
      enabled: true,
    },
  ],
  activeProvider: 'nvidia',
  activeModel: 'nvidia/nemotron-3-5-super',
  theme: 'dark',
  language: 'en',
  autoSave: true,
  autoSaveInterval: 30000,
  shortcuts: {},
};

const defaultTimeline: TimelineState = {
  duration: 10,
  fps: 30,
  currentTime: 0,
  playing: false,
  loop: false,
  zoom: 1,
};

const defaultEditor: EditorState = {
  selectedElements: [],
  hoveredElement: null,
  tool: 'select',
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridEnabled: true,
  snapToGrid: true,
  history: { past: [], future: [] },
  clipboard: [],
};

const defaultProject: Project = {
  id: generateId('proj'),
  name: 'Untitled Project',
  canvasSize: { width: 1920, height: 1080 },
  backgroundColor: '#1a1a2e',
  elements: [],
  animations: [],
  timeline: defaultTimeline,
  settings: {
    gridEnabled: true,
    gridSize: 20,
    snapToGrid: true,
    snapToObjects: true,
    showRulers: false,
    showGuides: false,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: 1,
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentProject: null,
        projects: [],
        templates: [],
        editor: defaultEditor,
        timeline: defaultTimeline,
        animations: [],
        aiProviders: defaultSettings.aiProviders,
        activeProviderId: defaultSettings.activeProvider,
        activeModelId: defaultSettings.activeModel,
        chatMessages: [],
        isAILoading: false,
        settings: defaultSettings,
        leftSidebarOpen: true,
        rightSidebarOpen: true,
        bottomTimelineOpen: true,
        activeLeftTab: 'projects',
        activeRightTab: 'properties',

        // Project actions
        setCurrentProject: (project) => {
          if (project) {
            set({
              currentProject: project,
              editor: { ...get().editor, selectedElements: [] },
              timeline: project.timeline,
            });
          } else {
            set({ currentProject: null });
          }
        },

        createProject: (name, size = { width: 1920, height: 1080 }) => {
          const project: Project = {
            ...defaultProject,
            id: generateId('proj'),
            name,
            canvasSize: size,
          };
          set((state) => ({
            projects: [...state.projects, project],
            currentProject: project,
            editor: { ...state.editor, selectedElements: [] },
            timeline: project.timeline,
          }));
          return project;
        },

        updateProject: (updates) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = { ...state.currentProject, ...updates, updatedAt: Date.now() };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        deleteProject: (id) => {
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
          }));
        },

        duplicateProject: (id) => {
          const project = get().projects.find((p) => p.id === id);
          if (!project) return null;
          const duplicated: Project = {
            ...deepClone(project),
            id: generateId('proj'),
            name: `${project.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            projects: [...state.projects, duplicated],
            currentProject: duplicated,
          }));
          return duplicated;
        },

        saveProject: () => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = { ...state.currentProject, updatedAt: Date.now() };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        // Element actions
        addElement: (element) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: [...state.currentProject.elements, element],
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: [element.id] },
            };
          });
        },

        updateElement: (id, updates) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: state.currentProject.elements.map((el) =>
                el.id === id ? { ...el, ...updates, updatedAt: Date.now() } as CanvasElement : el
              ),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        deleteElement: (id) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: state.currentProject.elements.filter((el) => el.id !== id),
              animations: state.currentProject.animations.filter((a) => a.elementId !== id),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: state.editor.selectedElements.filter((e) => e !== id) },
            };
          });
        },

        deleteElements: (ids) => {
          const idSet = new Set(ids);
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: state.currentProject.elements.filter((el) => !idSet.has(el.id)),
              animations: state.currentProject.animations.filter((a) => !idSet.has(a.elementId)),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: state.editor.selectedElements.filter((e) => !idSet.has(e)) },
            };
          });
        },

        duplicateElement: (id) => {
          const element = get().currentProject?.elements.find((el) => el.id === id);
          if (!element) return null;
          const duplicated: CanvasElement = {
            ...deepClone(element),
            id: generateId('el'),
            name: `${element.name} (Copy)`,
            transform: {
              ...element.transform,
              position: {
                x: element.transform.position.x + 20,
                y: element.transform.position.y + 20,
              },
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } as CanvasElement;
          get().addElement(duplicated);
          return duplicated;
        },

        selectElement: (id, multi = false) => {
          set((state) => ({
            editor: {
              ...state.editor,
              selectedElements: multi
                ? state.editor.selectedElements.includes(id)
                  ? state.editor.selectedElements.filter((e) => e !== id)
                  : [...state.editor.selectedElements, id]
                : [id],
            },
          }));
        },

        selectElements: (ids) => {
          set((state) => ({
            editor: { ...state.editor, selectedElements: ids },
          }));
        },

        clearSelection: () => {
          set((state) => ({
            editor: { ...state.editor, selectedElements: [] },
          }));
        },

        setHoveredElement: (id) => {
          set((state) => ({
            editor: { ...state.editor, hoveredElement: id },
          }));
        },

        reorderElements: (ids) => {
          set((state) => {
            if (!state.currentProject) return state;
            const idSet = new Set(ids);
            const reordered = [
              ...state.currentProject.elements.filter((el) => !idSet.has(el.id)),
              ...ids.map((id) => state.currentProject!.elements.find((el) => el.id === id)!).filter(Boolean),
            ];
            const updated = {
              ...state.currentProject,
              elements: reordered,
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        groupElements: (ids) => {
          const elements = get().currentProject?.elements.filter((el) => ids.includes(el.id));
          if (!elements || elements.length < 2) return null;
          
          const minX = Math.min(...elements.map((e) => e.transform.position.x));
          const minY = Math.min(...elements.map((e) => e.transform.position.y));
          const maxX = Math.max(...elements.map((e) => e.transform.position.x + (e.type === 'text' ? 200 : 100) * e.transform.scale.x));
          const maxY = Math.max(...elements.map((e) => e.transform.position.y + (e.type === 'text' ? 50 : 100) * e.transform.scale.y));
          
          const group: CanvasElement = {
            id: generateId('group'),
            type: 'group',
            name: 'Group',
            transform: {
              position: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
              rotation: 0,
              scale: { x: 1, y: 1 },
              opacity: 1,
            },
            style: {},
            locked: false,
            visible: true,
            zIndex: Math.max(...elements.map((e) => e.zIndex)) + 1,
            children: ids,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } as CanvasElement;
          
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: [
                ...state.currentProject.elements.filter((el) => !ids.includes(el.id)).map((el) =>
                  ids.includes(el.id) ? { ...el, parentId: group.id } as CanvasElement : el
                ),
                group,
              ],
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: [group.id] },
            };
          });
          return group;
        },

        ungroupElement: (id) => {
          const group = get().currentProject?.elements.find((el) => el.id === id && el.type === 'group');
          if (!group || !('children' in group)) return [];
          
          const children = get().currentProject?.elements.filter((el) => group.children.includes(el.id)) || [];
          
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: state.currentProject.elements
                .filter((el) => el.id !== id)
                .map((el) => (group.children.includes(el.id) ? { ...el, parentId: undefined } as CanvasElement : el)),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: group.children },
            };
          });
          return children;
        },

        alignElements: (ids, alignment) => {
          const elements = get().currentProject?.elements.filter((el) => ids.includes(el.id)) || [];
          if (elements.length < 2) return;
          
          let targetX = 0, targetY = 0;
          const bounds = elements.map((e) => {
            const w = e.type === 'text' ? 200 * e.transform.scale.x : 100 * e.transform.scale.x;
            const h = e.type === 'text' ? 50 * e.transform.scale.y : 100 * e.transform.scale.y;
            return { x: e.transform.position.x, y: e.transform.position.y, width: w, height: h };
          });
          
          switch (alignment) {
            case 'left':
              targetX = Math.min(...bounds.map((b) => b.x - b.width / 2));
              break;
            case 'center':
              targetX = (Math.min(...bounds.map((b) => b.x - b.width / 2)) + Math.max(...bounds.map((b) => b.x + b.width / 2))) / 2;
              break;
            case 'right':
              targetX = Math.max(...bounds.map((b) => b.x + b.width / 2));
              break;
            case 'top':
              targetY = Math.min(...bounds.map((b) => b.y - b.height / 2));
              break;
            case 'middle':
              targetY = (Math.min(...bounds.map((b) => b.y - b.height / 2)) + Math.max(...bounds.map((b) => b.y + b.height / 2))) / 2;
              break;
            case 'bottom':
              targetY = Math.max(...bounds.map((b) => b.y + b.height / 2));
              break;
          }
          
          elements.forEach((el) => {
            const w = el.type === 'text' ? 200 * el.transform.scale.x : 100 * el.transform.scale.x;
            const h = el.type === 'text' ? 50 * el.transform.scale.y : 100 * el.transform.scale.y;
            get().updateElement(el.id, {
              transform: {
                ...el.transform,
                position: {
                  x: alignment === 'left' ? targetX + w / 2 : alignment === 'center' ? targetX : alignment === 'right' ? targetX - w / 2 : el.transform.position.x,
                  y: alignment === 'top' ? targetY + h / 2 : alignment === 'middle' ? targetY : alignment === 'bottom' ? targetY - h / 2 : el.transform.position.y,
                },
              },
            });
          });
        },

        distributeElements: (ids, direction) => {
          const elements = get().currentProject?.elements.filter((el) => ids.includes(el.id)) || [];
          if (elements.length < 3) return;
          
          elements.sort((a, b) => a.transform.position[direction === 'horizontal' ? 'x' : 'y'] - b.transform.position[direction === 'horizontal' ? 'x' : 'y']);
          
          const first = elements[0];
          const last = elements[elements.length - 1];
          const firstPos = first.transform.position[direction === 'horizontal' ? 'x' : 'y'];
          const lastPos = last.transform.position[direction === 'horizontal' ? 'x' : 'y'];
          const step = (lastPos - firstPos) / (elements.length - 1);
          
          elements.forEach((el, index) => {
            if (index === 0 || index === elements.length - 1) return;
            const newPos = firstPos + step * index;
            get().updateElement(el.id, {
              transform: {
                ...el.transform,
                position: {
                  ...el.transform.position,
                  [direction === 'horizontal' ? 'x' : 'y']: newPos,
                },
              },
            });
          });
        },

        // Transform actions
        setElementTransform: (id, transform) => {
          get().updateElement(id, { transform: { ...get().currentProject?.elements.find((e) => e.id === id)?.transform, ...transform } as Transform });
        },

        setElementStyle: (id, style) => {
          get().updateElement(id, { style: { ...get().currentProject?.elements.find((e) => e.id === id)?.style, ...style } });
        },

        setElementProperty: (id, key, value) => {
          get().updateElement(id, { [key]: value } as Partial<CanvasElement>);
        },

        // Editor tool actions
        setTool: (tool) => {
          set((state) => ({
            editor: { ...state.editor, tool },
          }));
        },

        setZoom: (zoom) => {
          set((state) => ({
            editor: { ...state.editor, zoom: clamp(zoom, 0.1, 10) },
          }));
        },

        setPan: (pan) => {
          set((state) => ({
            editor: { ...state.editor, pan },
          }));
        },

        setPanDelta: (delta) => {
          set((state) => ({
            editor: {
              ...state.editor,
              pan: {
                x: state.editor.pan.x + delta.x,
                y: state.editor.pan.y + delta.y,
              },
            },
          }));
        },

        resetViewport: () => {
          set((state) => ({
            editor: { ...state.editor, zoom: 1, pan: { x: 0, y: 0 } },
          }));
        },

        toggleGrid: () => {
          set((state) => ({
            editor: { ...state.editor, gridEnabled: !state.editor.gridEnabled },
          }));
        },

        toggleSnapToGrid: () => {
          set((state) => ({
            editor: { ...state.editor, snapToGrid: !state.editor.snapToGrid },
          }));
        },

        // History actions
        pushHistory: (action) => {
          set((state) => ({
            editor: {
              ...state.editor,
              history: {
                past: [...state.editor.history.past.slice(-50), action],
                future: [],
              },
            },
          }));
        },

        undo: () => {
          set((state) => {
            const { past, future } = state.editor.history;
            if (past.length === 0) return state;
            const previous = past[past.length - 1];
            return {
              editor: {
                ...state.editor,
                history: {
                  past: past.slice(0, -1),
                  future: [previous, ...future],
                },
              },
            };
          });
        },

        redo: () => {
          set((state) => {
            const { past, future } = state.editor.history;
            if (future.length === 0) return state;
            const next = future[0];
            return {
              editor: {
                ...state.editor,
                history: {
                  past: [...past, next],
                  future: future.slice(1),
                },
              },
            };
          });
        },

        canUndo: () => get().editor.history.past.length > 0,
        canRedo: () => get().editor.history.future.length > 0,

        // Clipboard
        copyElements: (ids) => {
          const elements = get().currentProject?.elements.filter((el) => ids.includes(el.id)) || [];
          set((state) => ({
            editor: { ...state.editor, clipboard: deepClone(elements) },
          }));
        },

        pasteElements: (position = { x: 0, y: 0 }) => {
          const clipboard = get().editor.clipboard;
          if (clipboard.length === 0) return [];
          
          const pasted = clipboard.map((el) => ({
            ...deepClone(el),
            id: generateId('el'),
            name: `${el.name} (Copy)`,
            transform: {
              ...el.transform,
              position: {
                x: el.transform.position.x + position.x + 20,
                y: el.transform.position.y + position.y + 20,
              },
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })) as CanvasElement[];
          
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              elements: [...state.currentProject.elements, ...pasted],
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
              editor: { ...state.editor, selectedElements: pasted.map((e) => e.id) },
            };
          });
          return pasted;
        },

        cutElements: (ids) => {
          get().copyElements(ids);
          get().deleteElements(ids);
          return get().editor.clipboard;
        },

        // Timeline actions
        setTimelineDuration: (duration) => {
          set((state) => ({
            timeline: { ...state.timeline, duration },
            currentProject: state.currentProject
              ? { ...state.currentProject, timeline: { ...state.currentProject.timeline, duration } }
              : null,
          }));
        },

        setTimelineFPS: (fps) => {
          set((state) => ({
            timeline: { ...state.timeline, fps },
            currentProject: state.currentProject
              ? { ...state.currentProject, timeline: { ...state.currentProject.timeline, fps } }
              : null,
          }));
        },

        setCurrentTime: (time) => {
          set((state) => ({
            timeline: { ...state.timeline, currentTime: clamp(time, 0, state.timeline.duration) },
          }));
        },

        setPlaying: (playing) => {
          set((state) => ({
            timeline: { ...state.timeline, playing },
          }));
        },

        setTimelineLoop: (loop) => {
          set((state) => ({
            timeline: { ...state.timeline, loop },
          }));
        },

        setTimelineZoom: (zoom) => {
          set((state) => ({
            timeline: { ...state.timeline, zoom: clamp(zoom, 0.1, 100) },
          }));
        },

        addAnimationTrack: (track) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              animations: [...state.currentProject.animations, track],
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        updateAnimationTrack: (id, updates) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              animations: state.currentProject.animations.map((a) =>
                a.id === id ? { ...a, ...updates } : a
              ),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        deleteAnimationTrack: (id) => {
          set((state) => {
            if (!state.currentProject) return state;
            const updated = {
              ...state.currentProject,
              animations: state.currentProject.animations.filter((a) => a.id !== id),
              updatedAt: Date.now(),
            };
            return {
              currentProject: updated,
              projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
            };
          });
        },

        // Template actions
        addTemplate: (template) => {
          set((state) => ({
            templates: [...state.templates, template],
          }));
        },

        updateTemplate: (id, updates) => {
          set((state) => ({
            templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          }));
        },

        deleteTemplate: (id) => {
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          }));
        },

        createProjectFromTemplate: (templateId) => {
          const template = get().templates.find((t) => t.id === templateId);
          if (!template) return null;
          
          const project = get().createProject(template.name, template.canvasSize);
          get().updateProject({
            elements: template.elements,
            animations: template.animations,
          });
          return project;
        },

        // AI actions
        addAIProvider: (provider) => {
          set((state) => ({
            aiProviders: [...state.aiProviders, provider],
          }));
        },

        updateAIProvider: (id, updates) => {
          set((state) => ({
            aiProviders: state.aiProviders.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));
        },

        deleteAIProvider: (id) => {
          set((state) => ({
            aiProviders: state.aiProviders.filter((p) => p.id !== id),
            activeProviderId: state.activeProviderId === id ? state.aiProviders[0]?.id || '' : state.activeProviderId,
          }));
        },

        setActiveProvider: (id) => {
          set({ activeProviderId: id });
          const provider = get().aiProviders.find((p) => p.id === id);
          if (provider?.defaultModel) {
            get().setActiveModel(provider.defaultModel);
          }
        },

        setActiveModel: (id) => {
          set({ activeModelId: id });
        },

        addChatMessage: (message) => {
          set((state) => ({
            chatMessages: [...state.chatMessages, message],
          }));
        },

        updateChatMessage: (id, updates) => {
          set((state) => ({
            chatMessages: state.chatMessages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
          }));
        },

        deleteChatMessage: (id) => {
          set((state) => ({
            chatMessages: state.chatMessages.filter((m) => m.id !== id),
          }));
        },

        clearChatHistory: () => {
          set({ chatMessages: [] });
        },

        setAILoading: (loading) => {
          set({ isAILoading: loading });
        },

        // Settings actions
        updateSettings: (settings) => {
          set((state) => ({
            settings: { ...state.settings, ...settings },
          }));
        },

        resetSettings: () => {
          set({ settings: defaultSettings });
        },

        // UI actions
        toggleLeftSidebar: () => {
          set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen }));
        },

        toggleRightSidebar: () => {
          set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen }));
        },

        toggleBottomTimeline: () => {
          set((state) => ({ bottomTimelineOpen: !state.bottomTimelineOpen }));
        },

        setActiveLeftTab: (tab) => {
          set({ activeLeftTab: tab });
        },

        setActiveRightTab: (tab) => {
          set({ activeRightTab: tab });
        },

        // Export
        exportProject: async (options) => {
          const project = get().currentProject;
          if (!project) throw new Error('No project to export');
          
          // For now, return JSON blob
          const data = JSON.stringify(project, null, 2);
          return new Blob([data], { type: 'application/json' });
        },

        // Import
        importProject: (data) => {
          try {
            const project = JSON.parse(data) as Project;
            project.id = generateId('proj');
            project.name = `${project.name} (Imported)`;
            project.createdAt = Date.now();
            project.updatedAt = Date.now();
            
            set((state) => ({
              projects: [...state.projects, project],
              currentProject: project,
              editor: { ...state.editor, selectedElements: [] },
              timeline: project.timeline,
            }));
            return project;
          } catch {
            return null;
          }
        },
      }),
      {
        name: 'anitom-editor-store',
        partialize: (state) => ({
          projects: state.projects,
          templates: state.templates,
          aiProviders: state.aiProviders,
          activeProviderId: state.activeProviderId,
          activeModelId: state.activeModelId,
          settings: state.settings,
          chatMessages: state.chatMessages.slice(-50),
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);

// Selectors
export const useCurrentProject = () => useEditorStore((state) => state.currentProject);
export const useProjects = () => useEditorStore((state) => state.projects);
export const useTemplates = () => useEditorStore((state) => state.templates);
export const useEditor = () => useEditorStore((state) => state.editor);
export const useTimeline = () => useEditorStore((state) => state.timeline);
export const useAIProviders = () => useEditorStore((state) => state.aiProviders);
export const useActiveProvider = () => useEditorStore((state) => state.aiProviders.find((p) => p.id === state.activeProviderId));
export const useActiveModel = () => useEditorStore((state) => {
  const provider = state.aiProviders.find((p) => p.id === state.activeProviderId);
  return provider?.models.find((m) => m.id === state.activeModelId);
});
export const useChatMessages = () => useEditorStore((state) => state.chatMessages);
export const useIsAILoading = () => useEditorStore((state) => state.isAILoading);
export const useSettings = () => useEditorStore((state) => state.settings);
export const useLeftSidebarOpen = () => useEditorStore((state) => state.leftSidebarOpen);
export const useRightSidebarOpen = () => useEditorStore((state) => state.rightSidebarOpen);
export const useBottomTimelineOpen = () => useEditorStore((state) => state.bottomTimelineOpen);
export const useActiveLeftTab = () => useEditorStore((state) => state.activeLeftTab);
export const useActiveRightTab = () => useEditorStore((state) => state.activeRightTab);