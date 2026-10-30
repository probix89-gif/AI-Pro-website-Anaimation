import { NextRequest, NextResponse } from 'next/server';
import { callAI, AI_TOOLS, SYSTEM_PROMPT } from '@/lib/ai';

// Get the API key for a provider - prioritizes server-side env vars for NVIDIA
function getProviderApiKey(providerId: string): string | null {
  // Default NVIDIA provider uses server-side environment variable
  if (providerId === 'nvidia') {
    return process.env.NVIDIA_API_KEY || null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, stream = false, providerId = 'nvidia' } = await request.json();

    // Get API key server-side (never expose to client)
    const apiKey = getProviderApiKey(providerId);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Please configure NVIDIA_API_KEY on the server.' },
        { status: 400 }
      );
    }

    const activeModel = model || 'nvidia/nemotron-3-5-super';
    const baseUrl = 'https://integrate.api.nvidia.com/v1';

    const systemMessage = { role: 'system', content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...messages];

    if (stream) {
      // Streaming response
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages: allMessages,
          tools: AI_TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        return NextResponse.json({ error: error.message }, { status: response.status });
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const result = await callAI(allMessages, activeModel, apiKey, baseUrl, AI_TOOLS, 'auto');
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}