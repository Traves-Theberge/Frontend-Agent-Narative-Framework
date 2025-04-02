# Google Gemini SDK Technical Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Core Concepts: Line ~40
  - Gemini Models: Line ~50
  - Multimodal Capabilities: Line ~70
  - Safety Features: Line ~90
- Implementation: Line ~110
  - Basic Setup: Line ~120
  - Text Generation: Line ~150
  - Multimodal Processing: Line ~180
  - Streaming Responses: Line ~210
- Integration with Next.js: Line ~240
  - API Routes: Line ~250
  - Server Components: Line ~280
  - Client Components: Line ~310
- Advanced Features: Line ~340
  - Function Calling: Line ~350
  - System Instructions: Line ~380
  - Model Tuning: Line ~410
  - Safety Settings: Line ~440
- Performance Considerations: Line ~470
- Testing Strategies: Line ~500
- Best Practices: Line ~530

## References

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://ai.google.dev/)
- [Gemini JavaScript SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini Node.js SDK](https://github.com/google/generative-ai-js)
- [Gemini Safety Documentation](https://ai.google.dev/docs/safety_setting_gemini)
- [Next.js Documentation](https://nextjs.org/docs)

## Overview

This document provides a technical overview of integrating the Google Gemini SDK into our application. Gemini is Google's family of multimodal large language models (LLMs) that supports text, image, and video processing. This specification covers implementation details, API integration patterns, and best practices for using Gemini within our Next.js application.

## Core Concepts

### Gemini Models

The Gemini family offers several models optimized for different use cases:

| Model | Description | Best For |
|-------|-------------|----------|
| Gemini Pro 1.5 | Latest model with extended context window (up to 2M tokens) | Complex reasoning, multimodal tasks |
| Gemini 1.0 Pro | General-purpose model | Text generation, reasoning tasks |
| Gemini 1.0 Pro Vision | Multimodal model | Image understanding, video analysis |
| Gemini 1.0 Flash | Fastest, most efficient model | Quick responses, simpler tasks |

All Gemini models support:
- Text generation
- Chat conversations
- Function calling
- System instructions

### Multimodal Capabilities

Gemini models can process and generate content across multiple modalities:

- **Text Understanding**: Comprehending natural language, answering questions, and generating content
- **Image Analysis**: Understanding images, diagrams, screenshots, and visual content
- **Code Generation**: Creating and explaining code snippets across multiple programming languages
- **Video Processing**: Analyzing video content frame by frame (Gemini Pro 1.5)

```typescript
// Example of multimodal input
const multimodalContent = [
  {
    text: "What's in this image?",
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64EncodedImageData,
    },
  },
];
```

### Safety Features

Gemini incorporates robust safety features:

- **Safety Filters**: Detect and filter harmful content
- **Customizable Safety Settings**: Adjust thresholds for different harm categories
- **Rate Limiting**: Prevent abuse through API quotas
- **Content Moderation**: Flag potentially problematic outputs

```typescript
// Safety settings configuration
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  // Additional safety categories
];
```

## Implementation

### Basic Setup

To get started with Gemini in a Next.js project:

```bash
# Install the Gemini SDK
npm install @google/generative-ai
```

First, set up the client with your API key:

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY as string);

// Helper function to get a specific model
export function getGeminiModel(modelName = 'gemini-1.5-pro') {
  return genAI.getGenerativeModel({ model: modelName });
}
```

Ensure your API key is properly stored in environment variables:

```env
# .env.local
GOOGLE_AI_API_KEY=your_api_key_here
```

### Text Generation

Basic text generation with Gemini:

```typescript
// app/api/generate-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelName = 'gemini-1.5-pro' } = await req.json();
    
    // Get the specified model
    const model = getGeminiModel(modelName);
    
    // Generate content
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
```

### Multimodal Processing

Processing images and text together:

```typescript
// app/api/analyze-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'Describe this image in detail.';
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Convert the file to a byte array
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');
    
    // Get the vision-capable model
    const model = getGeminiModel('gemini-1.5-pro');
    
    // Prepare multimodal input
    const multimodalContent = [
      { text: prompt },
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ];
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: multimodalContent }],
    });
    
    const text = result.response.text();
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
```

### Streaming Responses

Implement streaming for more responsive user experiences:

```typescript
// app/api/stream/route.ts
import { NextRequest } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelName = 'gemini-1.5-pro' } = await req.json();
    
    // Get the specified model
    const model = getGeminiModel(modelName);
    
    // Create a streaming response
    const stream = await model.generateContentStream(prompt);
    
    // Set up the response stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to stream content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

## Integration with Next.js

### API Routes

Create a chat endpoint that maintains conversation history:

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { messages, modelName = 'gemini-1.5-pro' } = await req.json();
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }
    
    const model = getGeminiModel(modelName);
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();
    
    return NextResponse.json({ 
      role: 'assistant', 
      content: text,
      id: Date.now().toString(),
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
```

### Server Components

Use Gemini in React Server Components for server-side generation:

```typescript
// app/ai-content/[slug]/page.tsx
import { getGeminiModel } from '@/lib/gemini';
import { getArticleBySlug } from '@/lib/database';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }
  
  // Generate SEO-optimized meta description using Gemini
  const model = getGeminiModel('gemini-1.5-pro');
  const prompt = `Generate an SEO-friendly meta description (max 155 characters) for an article with the title: "${article.title}" and content about: "${article.summary}"`;
  
  const result = await model.generateContent(prompt);
  const metaDescription = result.response.text().slice(0, 155);
  
  return {
    title: article.title,
    description: metaDescription,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    return <div>Article not found</div>;
  }
  
  // Generate related articles suggestions
  const model = getGeminiModel('gemini-1.5-pro');
  const prompt = `Based on the article titled "${article.title}" about "${article.summary}", suggest 3 related topics that readers might be interested in. Format as a JSON array with objects containing 'title' and 'description' fields.`;
  
  const result = await model.generateContent(prompt);
  let relatedTopics = [];
  
  try {
    relatedTopics = JSON.parse(result.response.text());
  } catch (e) {
    console.error('Failed to parse JSON from Gemini response');
  }
  
  return (
    <div className="article-page">
      <h1>{article.title}</h1>
      <div className="article-content">{article.content}</div>
      
      {relatedTopics.length > 0 && (
        <div className="related-topics">
          <h2>Related Topics</h2>
          <ul>
            {relatedTopics.map((topic, index) => (
              <li key={index}>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Client Components

Create a chat interface using Gemini:

```typescript
// components/GeminiChat.tsx
'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ReactMarkdown } from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error('Chat error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg">
      <div className="flex items-center p-4 border-b">
        <Avatar className="h-8 w-8 mr-2">G</Avatar>
        <div className="font-semibold">Gemini Assistant</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Send a message to start chatting with Gemini
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Advanced Features

### Function Calling

Implement function calling with Gemini:

```typescript
// lib/gemini-tools.ts
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getGeminiModel } from './gemini';

// Define available tools
export const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {
              type: 'STRING',
              description: 'The city and state, e.g., San Francisco, CA',
            },
            unit: {
              type: 'STRING',
              enum: ['celsius', 'fahrenheit'],
              description: 'The temperature unit to use',
            },
          },
          required: ['location'],
        },
      },
    ],
  },
];

// Implement the actual function
export async function getCurrentWeather(location: string, unit: string = 'celsius') {
  // This would typically call a weather API
  // For simplicity, we're returning mock data
  return {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    condition: 'sunny',
    humidity: 45,
    windSpeed: 10,
  };
}

// Function to process a user query with function calling
export async function processQueryWithTools(query: string) {
  const model = getGeminiModel('gemini-1.5-pro');
  
  // Configure safety settings
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];
  
  // Start a chat session with function calling capabilities
  const chat = model.startChat({
    tools,
    safetySettings,
  });
  
  // Send the user query
  const result = await chat.sendMessage(query);
  const response = result.response;
  
  // Check if the model wants to call a function
  const functionCalls = response.functionCalls();
  
  if (functionCalls && functionCalls.length > 0) {
    const functionCall = functionCalls[0];
    
    if (functionCall.name === 'get_current_weather') {
      const args = functionCall.args;
      const location = args.location;
      const unit = args.unit || 'celsius';
      
      // Call the actual function
      const weatherData = await getCurrentWeather(location, unit);
      
      // Send the function response back to the model
      const functionResponse = await chat.sendMessage({
        functionResponse: {
          name: 'get_current_weather',
          response: weatherData,
        },
      });
      
      // Return the final model response
      return functionResponse.response.text();
    }
  }
  
  // If no function was called, return the direct response
  return response.text();
}
```

Usage in an API route:

```typescript
// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processQueryWithTools } from '@/lib/gemini-tools';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const response = await processQueryWithTools(query);
    
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Function calling error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process query' },
      { status: 500 }
    );
  }
}
```

### System Instructions

Use system instructions to control model behavior:

```typescript
// lib/gemini-system.ts
import { getGeminiModel } from './gemini';

export async function getResponseWithSystemPrompt(
  userMessage: string,
  systemInstruction: string
) {
  const model = getGeminiModel('gemini-1.5-pro');
  
  // Create a chat with system instructions
  const chat = model.startChat({
    systemInstruction,
  });
  
  // Send the user message
  const result = await chat.sendMessage(userMessage);
  
  return result.response.text();
}
```

Example system instructions:

```typescript
// components/CustomerSupport.tsx
'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function CustomerSupport() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/customer-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          systemInstruction: `
            You are a customer support representative for Acme Inc., a software company that develops productivity tools.
            Follow these guidelines:
            - Be friendly, professional, and concise.
            - Answer questions about our products: Acme Project Manager, Acme Time Tracker, and Acme Notes.
            - For pricing inquiries, our products cost: Project Manager ($29/month), Time Tracker ($19/month), and Notes ($9/month).
            - For technical issues, ask for specific details about the problem.
            - If you don't know an answer, direct them to support@acme.com.
            - Never mention that you are an AI.
          `,
        }),
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Customer support error:', error);
      setResponse('Sorry, we encountered an error processing your request.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Customer Support</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about our products or services..."
          rows={4}
          className="w-full"
          disabled={isLoading}
        />
        
        <Button type="submit" disabled={!query.trim() || isLoading}>
          {isLoading ? 'Sending...' : 'Submit'}
        </Button>
      </form>
      
      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Response:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
```

### Model Tuning

While Gemini doesn't currently support direct fine-tuning through the API, you can use methods like few-shot learning and embeddings:

```typescript
// lib/gemini-examples.ts
import { getGeminiModel } from './gemini';

interface Example {
  input: string;
  output: string;
}

export async function generateWithExamples(
  prompt: string,
  examples: Example[]
) {
  const model = getGeminiModel('gemini-1.5-pro');
  
  // Format the examples as part of the prompt
  const examplesText = examples
    .map(ex => `Input: ${ex.input}\nOutput: ${ex.output}`)
    .join('\n\n');
  
  const fullPrompt = `
    Here are some examples of the expected format:
    
    ${examplesText}
    
    Now, please respond to the following in the same format:
    
    Input: ${prompt}
    Output:
  `;
  
  const result = await model.generateContent(fullPrompt);
  let output = result.response.text();
  
  // Clean up output to extract just the generated response
  if (output.includes('Output:')) {
    output = output.split('Output:')[1].trim();
  }
  
  return output;
}
```

### Safety Settings

Configure safety thresholds for different harm categories:

```typescript
// lib/gemini-safety.ts
import {
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
} from '@google/generative-ai';
import { getGeminiModel } from './gemini';

export interface SafetyConfig {
  harassment?: HarmBlockThreshold;
  hateSpeech?: HarmBlockThreshold;
  sexuallyExplicit?: HarmBlockThreshold;
  dangerousContent?: HarmBlockThreshold;
}

const defaultConfig: SafetyConfig = {
  harassment: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  hateSpeech: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  sexuallyExplicit: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  dangerousContent: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
};

export function configureSafetySettings(config: SafetyConfig = defaultConfig) {
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: config.harassment || defaultConfig.harassment,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: config.hateSpeech || defaultConfig.hateSpeech,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: config.sexuallyExplicit || defaultConfig.sexuallyExplicit,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: config.dangerousContent || defaultConfig.dangerousContent,
    },
  ];
  
  return safetySettings;
}

export async function generateSafeContent(
  prompt: string,
  safetyConfig?: SafetyConfig,
  modelName = 'gemini-1.5-pro'
) {
  const model = getGeminiModel(modelName);
  const safetySettings = configureSafetySettings(safetyConfig);
  
  // Configure the model with safety settings
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    safetySettings,
  });
  
  return result.response.text();
}
```

## Performance Considerations

- **Model Selection**: Choose the appropriate model for your task. Use Gemini Flash for simpler tasks and Gemini Pro for more complex reasoning.
- **Caching**: Cache frequent responses to reduce API calls and improve performance.
- **Batch Processing**: Group multiple requests when possible.
- **Streaming**: Use streaming for longer responses to improve perceived performance.
- **Prompt Engineering**: Craft efficient prompts to get better responses with fewer tokens.
- **Context Window Management**: Be mindful of token limits, especially for chat applications.

```typescript
// lib/gemini-cache.ts
import { LRUCache } from 'lru-cache';
import { hash as hashString } from 'ohash';
import { getGeminiModel } from './gemini';

// Create an LRU cache with a max of 100 items that expire after 1 hour
const cache = new LRUCache<string, string>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
});

export async function generateWithCache(prompt: string, modelName = 'gemini-1.5-pro') {
  // Create a unique cache key based on the prompt and model
  const cacheKey = hashString(`${modelName}:${prompt}`);
  
  // Check if we have a cached response
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cached response, call the API
  const model = getGeminiModel(modelName);
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Cache the response
  cache.set(cacheKey, response);
  
  return response;
}
```

## Testing Strategies

```typescript
// __tests__/lib/gemini.test.ts
import { getGeminiModel } from '@/lib/gemini';
import { generateWithCache } from '@/lib/gemini-cache';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => {
  const generateContentMock = jest.fn().mockResolvedValue({
    response: {
      text: () => 'Mocked response',
    },
  });
  
  const GenerativeModel = jest.fn().mockImplementation(() => ({
    generateContent: generateContentMock,
  }));
  
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => new GenerativeModel()),
    })),
  };
});

describe('Gemini Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getGeminiModel', () => {
    it('should return a model instance', () => {
      const model = getGeminiModel();
      expect(model).toBeDefined();
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });
    
    it('should accept model name parameter', () => {
      const modelName = 'gemini-flash';
      const genAI = new GoogleGenerativeAI('fake-key');
      getGeminiModel(modelName);
      
      expect(genAI.getGenerativeModel).toHaveBeenCalledWith({
        model: modelName,
      });
    });
  });
  
  describe('generateWithCache', () => {
    it('should generate content and cache the result', async () => {
      const prompt = 'Test prompt';
      const result = await generateWithCache(prompt);
      
      expect(result).toBe('Mocked response');
      
      // Call again to test cache
      const cachedResult = await generateWithCache(prompt);
      expect(cachedResult).toBe('Mocked response');
      
      // The model should only be called once due to caching
      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Best Practices

1. **API Key Security**:
   - Store API keys securely in environment variables
   - Use server-side routes to protect your keys
   - Implement rate limiting and monitoring

2. **Error Handling**:
   - Implement robust error handling for API failures
   - Provide meaningful error messages to users
   - Have fallback options when the API is unavailable

3. **Prompt Engineering**:
   - Write clear, specific prompts
   - Include examples when needed
   - Use system instructions to guide model behavior
   - Structure prompts consistently

4. **Content Moderation**:
   - Implement appropriate safety settings
   - Review high-risk outputs before displaying to users
   - Have a moderation strategy for user-generated inputs

5. **Performance**:
   - Use caching for repeated queries
   - Implement streaming for long responses
   - Choose the right model for each task

6. **User Experience**:
   - Show loading states during API calls
   - Provide clear context on AI capabilities and limitations
   - Allow users to regenerate or modify responses
   - Design for graceful failure

7. **Monitoring and Logging**:
   - Log API calls and errors
   - Monitor usage to optimize costs
   - Track performance metrics
   - Analyze user interactions to improve prompts

## References

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://ai.google.dev/)
- [Gemini JavaScript SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini Node.js SDK](https://github.com/google/generative-ai-js)
- [Gemini Safety Documentation](https://ai.google.dev/docs/safety_setting_gemini)
- [Next.js Documentation](https://nextjs.org/docs)
