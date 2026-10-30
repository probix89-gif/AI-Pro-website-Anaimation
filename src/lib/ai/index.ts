import { create } from 'zustand';

interface AIProviderConfig {
  id: string;
  name: string;
  type: 'nvidia' | 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  baseUrl?: string;
  models: { id: string; name: string }[];
}

interface AIState {
  providers: AIProviderConfig[];
  activeProviderId: string;
  activeModelId: string;
  addProvider: (provider: AIProviderConfig) => void;
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
  setActiveModel: (id: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  providers: [
    {
      id: 'nvidia',
      name: 'NVIDIA',
      type: 'nvidia',
      apiKey: '',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      models: [
        { id: 'nvidia/nemotron-3-5-super', name: 'Nemotron 3.5 Super' },
        { id: 'nvidia/nemotron-3-5-8b', name: 'Nemotron 3.5 8B' },
        { id: 'nvidia/llama-3.1-nemotron-70b', name: 'Llama 3.1 Nemotron 70B' },
      ],
    },
  ],
  activeProviderId: 'nvidia',
  activeModelId: 'nvidia/nemotron-3-5-super',
  addProvider: (provider) =>
    set((state) => ({ providers: [...state.providers, provider] })),
  updateProvider: (id, updates) =>
    set((state) => ({
      providers: state.providers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProvider: (id) =>
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
      activeProviderId: state.activeProviderId === id ? state.providers[0]?.id || '' : state.activeProviderId,
    })),
  setActiveProvider: (id) => set({ activeProviderId: id }),
  setActiveModel: (id) => set({ activeModelId: id }),
}));

export async function callAI(
  messages: { role: string; content: string }[],
  model: string,
  apiKey: string,
  baseUrl: string,
  tools?: any[],
  toolChoice?: string
): Promise<{ content: string; toolCalls?: any[] }> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
      temperature: 0.7,
      max_tokens: 4096,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  return {
    content: choice.message.content || '',
    toolCalls: choice.message.tool_calls,
  };
}

export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_element',
      description: 'Create a new visual element on the canvas',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['rectangle', 'ellipse', 'text', 'image', 'frame', 'group', 'chart', 'diagram', 'mindmap', 'flowchart'],
          },
          name: { type: 'string' },
          position: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } } },
          size: { type: 'object', properties: { width: { type: 'number' }, height: { type: 'number' } } },
          style: { type: 'object' },
          properties: { type: 'object' },
        },
        required: ['type', 'name', 'position'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_element',
      description: 'Update an existing element',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          updates: { type: 'object' },
        },
        required: ['id', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_element',
      description: 'Delete an element by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_animation',
      description: 'Create an animation track for an element',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string' },
          property: { type: 'string' },
          keyframes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'number' },
                value: { type: 'number' },
                easing: { type: 'string' },
              },
              required: ['time', 'value'],
            },
          },
        },
        required: ['elementId', 'property', 'keyframes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_background',
      description: 'Set the canvas background color or image',
      parameters: {
        type: 'object',
        properties: {
          color: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'apply_template',
      description: 'Apply a template to the current project',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string' },
        },
        required: ['templateId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'export_project',
      description: 'Export the current project',
      parameters: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['png', 'jpg', 'webp', 'pdf', 'svg', 'mp4', 'gif', 'json'] },
          quality: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_templates',
      description: 'Search for templates by category or keyword',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
  },
];

export const SYSTEM_PROMPT = `You are Anitom AI, an expert motion graphics and visual design assistant. You help users create animations, infographics, diagrams, charts, presentations, and visual content through natural language.

You have access to tools that can create and manipulate visual elements on a canvas. The canvas is a 1920x1080 workspace by default.

When users ask you to create something:
1. Understand what they want to create
2. Break it down into elements (shapes, text, images, charts, diagrams)
3. Use the tools to create each element
4. Position and style them appropriately
5. Add animations if requested

Element types you can create:
- rectangle: rectangles, squares, cards, buttons
- ellipse: circles, ovals
- text: headings, body text, labels
- image: photos, illustrations, icons
- frame: containers for other elements
- group: logical groupings
- chart: bar, line, pie, area, scatter, radar charts
- diagram: flowcharts, sequence, class, state, ER, journey, Gantt, mindmap, timeline
- mindmap: hierarchical mind maps
- flowchart: process flows with decisions

Animation properties:
- position (x, y)
- rotation (degrees)
- scale (x, y)
- opacity (0-1)
- style properties (color, size, etc.)

Keyframes have: time (seconds), value, easing

Be creative, precise, and helpful. Ask clarifying questions if needed.`;