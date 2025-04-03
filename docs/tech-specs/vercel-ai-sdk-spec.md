# Vercel AI SDK Technical Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Core Concepts: Line ~40
  - Streaming: Line ~50
  - Providers: Line ~70
  - Assistants: Line ~90
  - Prompts: Line ~110
- Implementation: Line ~130
  - Basic Setup: Line ~140
  - Streaming Responses: Line ~170
  - Handling Events: Line ~200
  - Managing Chat History: Line ~230
- LLM Providers Integration: Line ~260
  - OpenAI: Line ~270
  - Anthropic: Line ~300
  - Hugging Face: Line ~330
  - Local Models: Line ~360
- Advanced Features: Line ~390
  - Function Calling: Line ~400
  - Tools: Line ~430
  - Assistants API: Line ~460
  - Middleware: Line ~490
- UI Components: Line ~520
  - Chat Messages: Line ~530
  - Chat Input: Line ~560
  - Modal: Line ~590
- Performance Considerations: Line ~620
- Testing Strategies: Line ~650
- Best Practices: Line ~680

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel AI SDK GitHub Repository](https://github.com/vercel/ai)
- [Vercel AI SDK Examples](https://github.com/vercel/ai/tree/main/examples)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/reference/react)

## Overview

This document provides a technical overview of the Vercel AI SDK, a library designed to help developers build AI-powered user interfaces with React and Next.js. The SDK streamlines the implementation of streaming responses from various AI models, manages chat state, and provides UI components for creating conversational interfaces.

## Core Concepts

### Streaming

The Vercel AI SDK uses streaming to provide real-time responses from AI models:

- **Server-Sent Events (SSE)** for efficient data transfer
- **Response streaming** for fast time-to-first-token
- **React Server Components (RSC)** compatibility
- **Edge Runtime** support for reduced latency

```typescript
// Streaming route handler example
import { StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Call your LLM provider with streaming enabled
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    stream: true,
  });
  
  // Return a streaming response
  return new StreamingTextResponse(stream);
}
```

### Providers

The SDK supports multiple LLM providers through a unified interface:

| Provider | Models | Features |
|----------|--------|----------|
| OpenAI | GPT-4, GPT-3.5 | Streaming, function calling, vision, assistants |
| Anthropic | Claude 3 (Opus, Sonnet, Haiku) | Streaming, vision |
| Hugging Face | Various open models | Streaming, local deployment |
| Cohere | Command, Command R | Streaming |
| Fireworks | Mixtral, Llama-2 | Streaming, function calling |
| Mistral | Mistral-7B, Mixtral-8x7B | Streaming |

### Assistants

The Vercel AI SDK provides a streamlined API for building AI assistants:

- **Assistant interfaces** for managing multi-turn conversations
- **Memory management** for storing conversation context
- **Function calling** for integrating external tools
- **Structured output** for consistent response formatting

```typescript
import { createAI, createAssistant, createUserMessage } from 'ai/react';

const assistant = createAssistant({
  name: 'Research Assistant',
  instructions: 'You are a helpful research assistant. Provide concise answers with sources.',
  model: 'gpt-4-turbo',
});

const AI = createAI({
  initial: {
    messages: [],
  },
  actions: {
    submitUserMessage: async (state, userMessage) => {
      const messages = [...state.messages, createUserMessage(userMessage)];
      
      return {
        ...state,
        messages,
      };
    },
  },
  assistant,
});
```

### Prompts

Vercel AI SDK supports structured prompt management:

- **Prompt templates** for maintaining consistency
- **Dynamic insertion** of variables into prompts
- **Prompt chaining** for complex workflows
- **System prompts** for setting AI behavior

```typescript
import { ChatPromptTemplate } from 'ai';

// Create a chat prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that answers questions about {topic}.'],
  ['user', '{question}'],
]);

// Populate the template with values
const messages = await promptTemplate.format({
  topic: 'JavaScript',
  question: 'How do I use async/await?',
});
```

## Implementation in Next.js

### Basic Setup

To get started with the Vercel AI SDK in a Next.js project:

```bash
# Install the SDK and provider libraries
npm install ai openai @anthropic-ai/sdk
```

```typescript
// app/api/chat/route.ts
import { StreamingTextResponse, OpenAIStream } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Request the LLM for streaming
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages,
  });

  // Convert to a stream
  const stream = OpenAIStream(response);
  
  // Return a streaming response
  return new StreamingTextResponse(stream);
}
```

```typescript
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <div className="font-bold">{message.role === 'user' ? 'User' : 'AI'}</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Say something..."
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

### Streaming Responses

The SDK provides utilities for handling streaming responses:

```typescript
// Custom streaming handler example
import { experimental_StreamData, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Create a data stream for additional data
  const data = new experimental_StreamData();
  
  // Call the LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages,
  });
  
  // Prepare the text stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      // Add additional data to the stream when completed
      data.append({ thinking: 'Analysis complete' });
      data.close();
    },
  });
  
  // Return a streaming response with the additional data
  return new StreamingTextResponse(stream, { status: 200, data });
}
```

### Handling Events

The SDK allows for handling different streaming events:

```typescript
// Client-side event handling
'use client';

import { useChat } from 'ai/react';

export default function ChatWithEvents() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      // Called when the API response starts streaming
      console.log('Streaming started', response);
    },
    onFinish: (message) => {
      // Called when the API response has finished streaming
      console.log('Streaming completed', message);
      
      // You can perform post-completion actions here
      analyzeResponse(message.content);
    },
    onError: (error) => {
      // Called when the API returns an error
      console.error('Error during streaming', error);
    },
  });
  
  return (
    // Chat UI implementation
  );
}
```

### Managing Chat History

The SDK provides built-in state management for chat history:

```typescript
// Custom chat history management
'use client';

import { useChat } from 'ai/react';
import { useEffect } from 'react';

export default function ChatWithMemory() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    initialMessages: [], // Start with empty messages or load from storage
  });
  
  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [setMessages]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-history', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat-history');
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat interface */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleClearChat}
          className="text-sm text-red-500"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}
```

## LLM Providers Integration

### OpenAI

```typescript
// api/chat/openai/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### Anthropic

```typescript
// api/chat/anthropic/route.ts
import { AnthropicStream, StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    stream: true,
    messages: messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    max_tokens: 1000,
    temperature: 0.7,
  });
  
  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
}
```

### Hugging Face

```typescript
// api/chat/huggingface/route.ts
import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';

export const runtime = 'edge';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Format messages for the model
  const formattedMessages = messages
    .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
  
  const response = await hf.textGenerationStream({
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    inputs: formattedMessages + '\nAssistant:',
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      return_full_text: false,
    },
  });
  
  const stream = HuggingFaceStream(response);
  return new StreamingTextResponse(stream);
}
```

### Local Models

```typescript
// api/chat/localai/route.ts
import { StreamingTextResponse } from 'ai';

export const runtime = 'nodejs'; // Use nodejs runtime for local models

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Connect to a local model server (e.g., Ollama, LocalAI)
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3',
      prompt: formatMessages(messages),
      stream: true,
    }),
  });
  
  // Return the stream directly
  return new StreamingTextResponse(response.body as ReadableStream);
}

function formatMessages(messages: any[]) {
  return messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n') + '\nAssistant:';
}
```

## Advanced Features

### Function Calling

The SDK supports function calling for AI models:

```typescript
// api/chat/function-calling/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define available functions
const functions = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state or country',
        },
      },
      required: ['location'],
    },
  },
];

// Function implementations
async function getWeather(location: string) {
  // In a real app, you would call a weather API here
  return {
    location,
    temperature: '72°F',
    condition: 'Sunny',
    humidity: '50%',
  };
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages,
    tools: functions.map(fn => ({
      type: 'function',
      function: fn,
    })),
  });
  
  const stream = OpenAIStream(response, {
    async experimental_onFunctionCall(functionCall) {
      // Handle the function call
      if (functionCall.name === 'get_weather') {
        const { location } = functionCall.arguments as { location: string };
        const weatherData = await getWeather(location);
        
        // Return a new assistant message with the function result
        return {
          role: 'assistant',
          content: `The weather in ${weatherData.location} is currently ${weatherData.condition} with a temperature of ${weatherData.temperature} and humidity of ${weatherData.humidity}.`,
        };
      }
    },
  });
  
  return new StreamingTextResponse(stream);
}
```

### Tools

```typescript
// Tool definition and usage with the AI SDK
import { useAssistant } from 'ai/react';
import { useState } from 'react';

// Define tools
const tools = [
  {
    name: 'searchProducts',
    description: 'Search for products in the catalog',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
        category: {
          type: 'string',
          enum: ['electronics', 'clothing', 'books', 'home'],
          description: 'Product category',
        },
      },
      required: ['query'],
    },
  },
];

export default function AssistantWithTools() {
  const [searchResults, setSearchResults] = useState([]);

  // Tool implementation
  async function searchProducts(query: string, category?: string) {
    // In a real app, you would call your product API
    const results = await fetch(`/api/products/search?q=${query}&category=${category || ''}`).then(r => r.json());
    setSearchResults(results);
    return results;
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAssistant({
    api: '/api/assistant',
    tools,
    onToolCall: async (call) => {
      if (call.name === 'searchProducts') {
        const { query, category } = call.arguments;
        return await searchProducts(query, category);
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat UI */}
      {searchResults.length > 0 && (
        <div className="bg-gray-50 p-4 mt-4 rounded-lg">
          <h3 className="font-bold">Search Results:</h3>
          <ul className="list-disc pl-5">
            {searchResults.map((product) => (
              <li key={product.id}>{product.name} - ${product.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Assistants API

```typescript
// app/api/assistant/route.ts
import { OpenAIAssistantStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or use an existing assistant
const assistantId = process.env.OPENAI_ASSISTANT_ID || '';

export async function POST(req: Request) {
  const { messages, threadId: previousThreadId } = await req.json();
  
  // Create a thread if needed, or continue an existing one
  const threadId = previousThreadId || (await openai.beta.threads.create({})).id;
  
  // Add user message to thread
  const userMessage = messages[messages.length - 1];
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage.content,
  });
  
  // Run the assistant
  const runStream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });
  
  // Create a stream from the run
  const stream = OpenAIAssistantStream(runStream);
  
  // Return the stream response with the thread ID
  const response = new StreamingTextResponse(stream);
  
  // Add the thread ID to the response
  response.headers.set('x-thread-id', threadId);
  
  return response;
}
```

### Middleware

The SDK supports middleware for custom processing:

```typescript
// lib/middleware.ts
import { createMiddleware } from 'ai';

export const loggingMiddleware = createMiddleware({
  before: async ({ messages }) => {
    console.log('Processing message:', messages[messages.length - 1]);
    return { messages };
  },
  after: async ({ messages, response, data }) => {
    console.log('Response received:', response, data);
    return { messages, response, data };
  },
});

export const ratelimitMiddleware = createMiddleware({
  before: async ({ messages }) => {
    // Check for rate limits
    const userId = getUserId();
    const canProceed = await checkRateLimit(userId);
    
    if (!canProceed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return { messages };
  },
});

// Usage in API route
import { loggingMiddleware, ratelimitMiddleware } from '@/lib/middleware';

export async function POST(req: Request) {
  // Apply middleware
  return ratelimitMiddleware(
    loggingMiddleware(
      async (req) => {
        // Original handler code
        const { messages } = await req.json();
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages,
          stream: true,
        });
        
        return new StreamingTextResponse(OpenAIStream(response));
      }
    )
  )(req);
}
```

## UI Components

### Chat Messages

```tsx
// components/ChatMessages.tsx
import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col p-4 rounded-lg ${
            message.role === 'user'
              ? 'bg-blue-100 self-end'
              : 'bg-gray-100 self-start'
          }`}
        >
          <div className="font-semibold mb-1">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </div>
          <ReactMarkdown className="prose">
            {message.content}
          </ReactMarkdown>
        </div>
      ))}
      
      {isLoading && (
        <div className="bg-gray-100 self-start p-4 rounded-lg animate-pulse">
          <div className="font-semibold mb-1">AI Assistant</div>
          <div>Thinking...</div>
        </div>
      )}
    </div>
  );
}
```

### Chat Input

```tsx
// components/ChatInput.tsx
import { useState, FormEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Type a message...' }: ChatInputProps) {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

### Modal

```tsx
// components/AIModal.tsx
'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { X } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export function AIModal({ isOpen, onClose, initialPrompt }: AIModalProps) {
  const [showModal, setShowModal] = useState(isOpen);
  
  const { messages, handleSubmit, input, handleInputChange, isLoading } = useChat({
    initialInput: initialPrompt,
    onFinish: () => {
      // Optional: do something when the response finishes
    },
  });
  
  // Handle modal visibility
  useState(() => {
    setShowModal(isOpen);
  }, [isOpen]);
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <button
            onClick={() => {
              setShowModal(false);
              onClose();
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit}>
            <ChatInput 
              value={input}
              onChange={handleInputChange}
              isLoading={isLoading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Performance Considerations

- **Edge Runtime**: Deploy your API routes with Edge Runtime for reduced latency.
- **Response Streaming**: Use streaming responses to improve perceived performance.
- **Memory Management**: Implement efficient memory management for long conversations.
- **Rate Limiting**: Implement rate limiting to prevent abuse and manage costs.
- **Caching**: Cache repetitive responses when possible to reduce API calls.
- **Optimistic UI Updates**: Show user messages immediately before awaiting responses.
- **Lazy Loading**: Lazy load the chat interface when not immediately needed.

```typescript
// Optimize performance with edge runtime and response compression
export const runtime = 'edge';

export async function POST(req: Request) {
  // Implementation
  
  const stream = OpenAIStream(response);
  const streamingResponse = new StreamingTextResponse(stream);
  
  // Add cache control headers for static content
  streamingResponse.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
  
  return streamingResponse;
}
```

## Testing Strategies

```typescript
// __tests__/api/chat.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/chat/route';

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Mocked response',
                  },
                },
              ],
            }),
          },
        },
      };
    }),
  };
});

describe('/api/chat', () => {
  it('returns a streaming response', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        messages: [
          { role: 'user', content: 'Hello, AI!' },
        ],
      },
    });
    
    const response = await POST(req);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  });
});
```

## Best Practices

1. **Environment Variables**: Store API keys securely in environment variables.

```typescript
// .env.local
OPENAI_API_KEY=sk-....
ANTHROPIC_API_KEY=sk-ant-...
```

2. **Error Handling**: Implement robust error handling for API failures.

```typescript
try {
  const response = await openai.chat.completions.create({
    // configuration
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
} catch (error) {
  console.error('Error calling OpenAI:', error);
  return new Response(
    JSON.stringify({
      error: 'There was an error processing your request',
      details: error.message,
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

3. **Prompt Management**: Centralize and version your prompts.

```typescript
// lib/prompts.ts
export const SYSTEM_PROMPTS = {
  DEFAULT: 'You are a helpful AI assistant.',
  CUSTOMER_SUPPORT: 'You are a customer support representative for Acme Inc...',
  TECHNICAL: 'You are a technical expert specializing in web development...',
};

// Usage
import { SYSTEM_PROMPTS } from '@/lib/prompts';

const { messages } = useChat({
  initialMessages: [
    { role: 'system', content: SYSTEM_PROMPTS.TECHNICAL },
  ],
});
```

4. **Rate Limiting**: Implement rate limiting to prevent abuse.

5. **Monitoring**: Monitor usage and performance of your AI features.

6. **Progressive Enhancement**: Design your UI to work without JavaScript when possible.

7. **Accessibility**: Ensure your AI interfaces are accessible to all users.

8. **Testing**: Thoroughly test AI responses and error handling.