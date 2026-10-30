export interface Vector2D {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Transform {
  position: Vector2D;
  rotation: number;
  scale: Vector2D;
  opacity: number;
}

export interface AnimationKeyframe {
  time: number;
  transform: Transform;
  easing?: EasingType | string;
}

export interface AnimationTrack {
  id: string;
  elementId: string;
  property: string;
  keyframes: AnimationKeyframe[];
}

export type EasingType = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-sine'
  | 'ease-out-sine'
  | 'ease-in-out-sine'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  | 'ease-in-quint'
  | 'ease-out-quint'
  | 'ease-in-out-quint'
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-in-out-expo'
  | 'ease-in-circ'
  | 'ease-out-circ'
  | 'ease-in-out-circ'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'ease-in-out-elastic'
  | 'ease-in-bounce'
  | 'ease-out-bounce'
  | 'ease-in-out-bounce';

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  blur?: number;
  shadow?: ShadowStyle;
  lineHeight?: number;
  letterSpacing?: number;
  mixBlendMode?: string;
  filter?: string;
}

export interface ShadowStyle {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  transform: Transform;
  style: ElementStyle;
  locked: boolean;
  visible: boolean;
  parentId?: string;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export type ElementType = 
  | 'rectangle'
  | 'ellipse'
  | 'text'
  | 'image'
  | 'path'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'frame'
  | 'group'
  | 'chart'
  | 'diagram'
  | 'mindmap'
  | 'flowchart'
  | 'animation';

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
  cornerRadius: number;
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  fit: 'cover' | 'contain' | 'fill' | 'none';
}

export interface PathElement extends BaseElement {
  type: 'path';
  pathData: string;
}

export interface PolygonElement extends BaseElement {
  type: 'polygon';
  sides: number;
}

export interface StarElement extends BaseElement {
  type: 'star';
  points: number;
  innerRadius: number;
  outerRadius: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  startPoint: Vector2D;
  endPoint: Vector2D;
  startArrow?: boolean;
  endArrow?: boolean;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  startPoint: Vector2D;
  endPoint: Vector2D;
  headSize: number;
}

export interface FrameElement extends BaseElement {
  type: 'frame';
  children: string[];
  clipsContent: boolean;
  backgroundColor?: string;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  children: string[];
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  data: ChartData;
  options: ChartOptions;
}

export interface DiagramElement extends BaseElement {
  type: 'diagram';
  diagramType: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'journey' | 'gantt' | 'pie' | 'quadrant' | 'requirement' | 'git' | 'mindmap' | 'timeline' | 'zenuml' | 'sankey' | 'block' | 'packet' | 'architecture';
  mermaidCode: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface MindmapElement extends BaseElement {
  type: 'mindmap';
  root: MindmapNode;
}

export interface FlowchartElement extends BaseElement {
  type: 'flowchart';
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface AnimationElement extends BaseElement {
  type: 'animation';
  animationType: 'lottie' | 'keyframe' | 'particle' | 'morph' | 'text';
  duration: number;
  loop: boolean;
  autoplay: boolean;
  data: Record<string, unknown>;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth?: number;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: { display: boolean; position: 'top' | 'bottom' | 'left' | 'right' };
    title: { display: boolean; text: string };
  };
  scales?: Record<string, unknown>;
}

export interface DiagramNode {
  id: string;
  type: string;
  label: string;
  position: Vector2D;
  style: ElementStyle;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style: ElementStyle;
}

export interface MindmapNode {
  id: string;
  label: string;
  children: MindmapNode[];
  position: Vector2D;
  style: ElementStyle;
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'input' | 'output' | 'document' | 'database';
  label: string;
  position: Vector2D;
  style: ElementStyle;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: 'yes' | 'no' | 'true' | 'false';
  style: ElementStyle;
}

export type CanvasElement = 
  | RectangleElement
  | EllipseElement
  | TextElement
  | ImageElement
  | PathElement
  | PolygonElement
  | StarElement
  | LineElement
  | ArrowElement
  | FrameElement
  | GroupElement
  | ChartElement
  | DiagramElement
  | MindmapElement
  | FlowchartElement
  | AnimationElement;

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  canvasSize: Size;
  backgroundColor: string;
  elements: CanvasElement[];
  animations: AnimationTrack[];
  timeline: TimelineState;
  settings: ProjectSettings;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface TimelineState {
  duration: number;
  fps: number;
  currentTime: number;
  playing: boolean;
  loop: boolean;
  zoom: number;
}

export interface ProjectSettings {
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showRulers: boolean;
  showGuides: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  tags: string[];
  canvasSize: Size;
  elements: CanvasElement[];
  animations: AnimationTrack[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TemplateCategory = 
  | 'presentation'
  | 'social-media'
  | 'marketing'
  | 'education'
  | 'diagram'
  | 'chart'
  | 'animation'
  | 'infographic'
  | 'mindmap'
  | 'flowchart'
  | 'ui-design'
  | 'video'
  | 'custom';

export interface AIProvider {
  id: string;
  name: string;
  type: 'nvidia' | 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  models: AIModel[];
  defaultModel?: string;
  enabled: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1kTokens?: { input: number; output: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  attachments?: Attachment[];
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  name: string;
  result: unknown;
  error?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'project';
  url: string;
  name: string;
  size: number;
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface EditorState {
  selectedElements: string[];
  hoveredElement: string | null;
  tool: EditorTool;
  zoom: number;
  pan: Vector2D;
  gridEnabled: boolean;
  snapToGrid: boolean;
  history: HistoryState;
  clipboard: CanvasElement[];
}

export type EditorTool = 
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'text'
  | 'image'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'frame'
  | 'hand'
  | 'zoom'
  | 'eraser';

export interface HistoryState {
  past: EditorAction[];
  future: EditorAction[];
}

export interface EditorAction {
  type: string;
  timestamp: number;
  elements: CanvasElement[];
  description: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'pdf' | 'svg' | 'mp4' | 'gif' | 'mov' | 'json';
  quality: number;
  scale: number;
  transparent: boolean;
  includeAnimations: boolean;
  frameRange?: { start: number; end: number };
  fps?: number;
}

export interface UserSettings {
  aiProviders: AIProvider[];
  activeProvider: string;
  activeModel: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  shortcuts: Record<string, string>;
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
}