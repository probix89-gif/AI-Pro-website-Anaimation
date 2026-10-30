'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  Paperclip,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  X,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  FileText,
  Code,
  Zap,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { AI_TOOLS } from '@/lib/ai';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { CodeBlock } from '../ui/CodeBlock';
import type { ChatMessage as ChatMessageType } from '@/types';

type ChatMessage = ChatMessageType;

export function ChatPanel() {
  const {
    chatMessages,
    isAILoading,
    activeModelId,
    addChatMessage,
    updateChatMessage,
    clearChatHistory,
    setAILoading,
  } = useEditorStore();

  const [inputValue, setInputValue] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAILoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !isAILoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    const userInput = inputValue;
    setInputValue('');
    setAILoading(true);

    // Add placeholder for assistant response
    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    addChatMessage(assistantMessage);

    try {
      // Call AI API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages.map((m) => ({ role: m.role, content: m.content })).concat([
            { role: 'user', content: userInput },
          ]),
          model: activeModelId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  updateChatMessage(assistantMessageId, { content: fullContent });
                }

                // Handle tool calls
                const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
                if (toolCalls) {
                  // Handle tool calls
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      updateChatMessage(assistantMessageId, { content: fullContent, isStreaming: false });
    } catch (error) {
      updateChatMessage(assistantMessageId, {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isStreaming: false,
      });
    } finally {
      setAILoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegenerate = (messageId: string) => {
    const messageIndex = chatMessages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = chatMessages[messageIndex - 1];
      if (userMessage.role === 'user') {
        // Remove this and subsequent messages
        // Then resend
      }
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full bg-secondary flex-1">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">{activeModelId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-accent transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-accent transition-colors" title="Clear Chat" onClick={clearChatHistory}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Start a conversation</h3>
            <p className="text-sm max-w-xs mb-4">
              Ask me to create animations, diagrams, charts, or any visual content.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              {[
                'Create a flowchart for user login',
                'Animate a bar chart from data',
                'Design a modern presentation slide',
                'Generate a mind map for project planning',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    handleSendMessage();
                  }}
                  className="p-2 text-left text-xs bg-accent rounded-lg hover:bg-accent/80 transition-colors text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              onRegenerate={handleRegenerate}
              onCopy={handleCopy}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAILoading ? 'AI is thinking...' : 'Describe what you want to create...'}
            disabled={isAILoading}
            rows={1}
            className="w-full px-4 py-3 bg-input border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none min-h-[48px] max-h-48 pr-12"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button
              className="p-1.5 rounded hover:bg-accent transition-colors"
              onClick={() => setShowAttachments(!showAttachments)}
              title="Attach"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAILoading}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-accent rounded">Enter</kbd>
          <span>Send</span>
          <kbd className="px-1.5 py-0.5 bg-accent rounded">Shift+Enter</kbd>
          <span>New line</span>
          <span className="flex-1" />
          {isAILoading && (
            <span className="flex items-center gap-1 text-primary">
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessageItem({
  message,
  onRegenerate,
  onCopy,
}: {
  message: ChatMessage;
  onRegenerate: (id: string) => void;
  onCopy: (content: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block max-w-[85%] px-4 py-2 rounded-2xl text-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-accent text-foreground rounded-bl-none'
          )}
        >
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Message Actions */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isUser && (
            <>
              <button
                onClick={() => onCopy(message.content)}
                className="p-1 rounded hover:bg-accent transition-colors"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded hover:bg-accent transition-colors"
                title="Regenerate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-accent transition-colors" title="Good response">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-accent transition-colors" title="Bad response">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <div className="font-medium mb-1">Tools used:</div>
            <ul className="space-y-1">
              {message.toolCalls.map((tool: any) => (
                <li key={tool.id} className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <code>{tool.function.name}</code>
                  <span className="text-muted-foreground">({JSON.stringify(tool.function.arguments).slice(0, 50)}...)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}