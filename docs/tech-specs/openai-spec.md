# OpenAI API Technical Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- API Reference: Line ~40
- Core Endpoints: Line ~50
  - Chat Completions API: Line ~60
  - Response Formats: Line ~80

### Implementation
- Authentication: Line ~100
- Making Requests: Line ~120
- Streaming Responses: Line ~150
- Error Handling: Line ~180

### Advanced Features
- Function Calling: Line ~210
- Vision Capabilities: Line ~240
- Fine-tuning: Line ~270
- Embeddings: Line ~300

### Best Practices
- Prompt Engineering: Line ~330
- Rate Limiting: Line ~360
- Cost Optimization: Line ~390
- Security: Line ~420

### Additional Information
- SDKs and Libraries: Line ~450

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [Models Overview](https://platform.openai.com/docs/models)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [OpenAI Usage Policies](https://openai.com/policies/usage-policies)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

## Overview

This document provides a technical overview of OpenAI's API capabilities, integration patterns, and best practices. OpenAI offers powerful AI models that can be integrated into applications for natural language processing, content generation, image creation, and more.

## API Reference

- **Base URL**: `https://api.openai.com/v1`
- **Documentation**: [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- **Authentication**: Bearer token authentication using API keys

## Core Endpoints

### Chat Completions API

- **Endpoint**: `/chat/completions`
- **Method**: POST
- **Purpose**: Generate conversational responses based on provided prompts
- **Models**: 
  - GPT-4o - Latest model with optimal performance across text, vision, and audio
  - GPT-4o mini - Smaller, faster, and more cost-effective version of GPT-4o
  - GPT-4 Turbo - High capability model with knowledge cutoff of April 2023
  - GPT-3.5 Turbo - Cost-effective option for less complex tasks
- **Key Features**:
  - Streaming responses for real-time feedback
  - System messages for defining assistant behavior
  - Conversation history management
  - JSON mode for structured outputs
  - Function/tool calling for external integrations
  - Vision capabilities for image analysis

### Response Formats

#### Standard Response Format

```typescript
interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | "function_call";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint: string;
}
```

Example response:
```json
{
  "id": "chatcmpl-123abc",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The response text from the model"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  },
  "system_fingerprint": "fp_123abc"
}
```

#### JSON Mode Response Format

JSON mode forces the model to return responses in valid JSON format. This is useful for structured data extraction and API integrations.

```typescript
interface JSONModeRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
    tool_call_id?: string;
  }>;
  response_format: {
    type: "json_object";
  };
  temperature?: number;
}
```

Example implementation:
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: "You are a helpful assistant that outputs JSON."
    },
    {
      role: "user",
      content: "Return a JSON object with keys for 'topic', 'summary', and 'sources'"
    }
  ]
});

// Example response.choices[0].message.content:
// {
//   "topic": "Artificial Intelligence",
//   "summary": "AI is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence.",
//   "sources": [
//     {
//       "title": "Introduction to AI",
//       "url": "https://example.com/ai-intro",
//       "reliability": "high"
//     }
//   ]
// }
```

#### Tool Calling Response Format

Tool calling allows the model to request external actions through defined function interfaces.

```typescript
interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface ToolCallResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: null;
      tool_calls: ToolCall[];
    };
    finish_reason: "tool_calls";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

Example response:
```json
{
  "id": "chatcmpl-123abc",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "search_web",
              "arguments": "{\"query\":\"latest research on AI safety\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

Implementation example:
```typescript
// Define tools
const tools = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          num_results: {
            type: "integer",
            description: "Number of search results to return"
          }
        },
        required: ["query"]
      }
    }
  }
];

// Request with tools
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are an assistant with web search capabilities." },
    { role: "user", content: "Find the latest information about quantum computing breakthroughs" }
  ],
  tools: tools,
  tool_choice: "auto" // Let the model decide when to use tools
});

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  const toolCalls = response.choices[0].message.tool_calls;
  const toolResults = [];
  
  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "search_web") {
      const args = JSON.parse(toolCall.function.arguments);
      const searchResults = await performWebSearch(args.query, args.num_results || 3);
      toolResults.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: "search_web",
        content: JSON.stringify(searchResults)
      });
    }
  }
  
  // Continue the conversation with tool results
  const followUpResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an assistant with web search capabilities." },
      { role: "user", content: "Find the latest information about quantum computing breakthroughs" },
      response.choices[0].message,
      ...toolResults
    ]
  });
}
```

#### Streaming Response Format

Streaming allows for real-time display of model responses as they're generated.

```typescript
interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: "assistant";
      content?: string | null;
      tool_calls?: Partial<ToolCall>[];
    };
    finish_reason: null | "stop" | "length" | "tool_calls" | "content_filter" | "function_call";
  }>;
}
```

Implementation example:
```typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain quantum computing" }
  ],
  stream: true
});

// Process stream in browser
let responseText = "";
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || "";
  responseText += content;
  // Update UI with each chunk
  updateUI(responseText);
}

// Process stream in Node.js
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Write a poem about AI" }],
  stream: true,
});

// Stream the response to the client
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || "";
  if (content) {
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }
}

res.write('data: [DONE]\n\n');
res.end();
```

#### Vision Response Format

For multimodal inputs with images:

```typescript
interface ImageContent {
  type: "image_url";
  image_url: {
    url: string; // Can be a URL or base64 data URI
    detail?: "low" | "high" | "auto";
  };
}

interface TextContent {
  type: "text";
  text: string;
}

type Content = TextContent | ImageContent | (TextContent | ImageContent)[];

interface VisionRequest {
  model: string; // Must be a vision-capable model like "gpt-4o"
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: Content;
  }>;
  max_tokens?: number;
}
```

Implementation example:
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What's in this image?" },
        {
          type: "image_url",
          image_url: {
            url: "https://example.com/image.jpg",
            detail: "high"
          }
        }
      ]
    }
  ],
  max_tokens: 300
});
```

### Embeddings API

- **Endpoint**: `/embeddings`
- **Method**: POST
- **Purpose**: Generate vector embeddings for semantic search and similarity analysis
- **Models**: 
  - text-embedding-3-large (latest) - Higher quality with dimensions up to 3072
  - text-embedding-3-small - Cost-effective option with dimensions up to 1536
- **Key Features**:
  - Document similarity search
  - Content indexing for retrieval
  - Integration with vector databases
  - Semantic search capabilities

### Assistants API

- **Endpoint**: `/assistants`
- **Method**: Various (POST, GET, DELETE)
- **Purpose**: Create and manage specialized AI assistants
- **Key Features**:
  - Domain-specific assistants
  - Tool calling for external integrations
  - File handling for document analysis
  - Thread and message management
  - Knowledge retrieval capabilities

### Images API

- **Endpoint**: `/images/generations`
- **Method**: POST
- **Purpose**: Generate images from text descriptions
- **Model**: DALL-E 3
- **Key Features**:
  - High-quality image generation
  - Content filtering and safety measures
  - Various size and quality options
  - Creative and realistic image styles

## Implementation Architecture

### Client-Side Integration

```typescript
// Example client implementation
import { OpenAI } from 'openai';

// Initialize with environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional
});

// Chat completion with streaming
const streamCompletion = async (query: string, context: string[]) => {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant...' },
      ...context.map(msg => ({ role: 'user', content: msg })),
      { role: 'user', content: query }
    ],
    temperature: 0.7,
    stream: true,
  });
  
  return stream;
};

// Function/tool calling example
const functionCallingExample = async (query: string) => {
  return await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant...' },
      { role: 'user', content: query }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'search_web',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query'
              }
            },
            required: ['query']
          }
        }
      }
    ],
    tool_choice: 'auto'
  });
};
```

### Server-Side Implementation Best Practices

- Create a proxy API route to secure API keys
- Implement rate limiting and usage tracking
- Cache common responses for performance
- Set up error handling and fallback mechanisms
- Implement server-side streaming with appropriate middleware

## Security Considerations

- **API Key Management**:
  - Store API keys in environment variables
  - Never expose keys in client-side code
  - Implement key rotation policies
  - Use scoped API keys with appropriate permissions

- **Content Filtering**:
  - Apply content moderation to user inputs
  - Implement OpenAI's content filtering options
  - Create fallback responses for filtered content
  - Monitor usage for abuse patterns

- **Rate Limiting**:
  - Implement token usage tracking
  - Set up user quotas and fair usage policies
  - Create graceful degradation for rate limit errors
  - Implement tiered access based on user roles

## Performance Optimization

- Implement response caching for common queries
- Use streaming responses for better user experience
- Optimize prompt design for token efficiency
- Implement batch processing for embeddings generation
- Use compression for API responses
- Implement client-side state management for conversation history

## Error Handling

- Create comprehensive error handling for API failures
- Implement retry logic with exponential backoff
- Provide user-friendly error messages
- Log detailed errors for debugging
- Set up monitoring and alerting for API issues

## Testing Strategy

- Unit test API client wrapper functions
- Mock OpenAI responses for integration tests
- Test error handling and edge cases
- Validate prompt effectiveness with real queries
- Implement end-to-end testing for critical user flows

## Cost Management

- Implement token counting and usage tracking
- Set up budget alerts and monitoring
- Optimize prompts to reduce token usage
- Cache responses to minimize API calls
- Use tiered model selection based on query complexity
- Implement fallback to cheaper models when appropriate
