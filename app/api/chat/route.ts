import { openai } from '@ai-sdk/openai';
// Import necessary types cautiously, let inference work where possible
import { streamText } from 'ai'; 
import { NextRequest, NextResponse } from 'next/server';
import { tools } from '../../ai/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define a type for the expected user message data for direct tool calls
interface DirectToolCallData {
  action: 'callTool';
  toolName: keyof typeof tools;
  args: Record<string, unknown>;
  linkedToolCallId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Log the request arrival
    console.log('[API] Received POST request to /api/chat');

    // Read the body ONCE
    let parsedBody;
    let messages;
    try {
      parsedBody = await req.json(); // Read JSON body once
      messages = parsedBody.messages; // Extract messages

      // --- Debugging: Log parsed body ---
      console.log('[API Debug] Parsed request body:', JSON.stringify(parsedBody, null, 2)); // Log the whole parsed body

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        console.warn('[API Warning] Parsed messages array is missing, not an array, or empty.');
        // Optionally return an error if messages are absolutely required
        return new NextResponse(JSON.stringify({ error: 'Invalid or missing messages array in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (parseError) {
      console.error('[API Error] Failed to parse request body as JSON:', parseError);
      return new NextResponse(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Use the already extracted 'messages' variable
    // const { messages } = await req.json(); // THIS LINE IS REMOVED

    // Basic check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('[API Error] Missing OPENAI_API_KEY');
      return new Response('Missing OPENAI_API_KEY', { status: 500 });
    }

    const lastUserMessage = messages[messages.length - 1];
    let directToolCallData: DirectToolCallData | null = null;

    // --- Direct Tool Call Detection Logic --- (Keep detection for logging/potential future use)
    if (
      lastUserMessage?.role === 'user' &&
      lastUserMessage.data &&
      typeof lastUserMessage.data === 'object' &&
      'action' in lastUserMessage.data &&
      lastUserMessage.data.action === 'callTool' &&
      'toolName' in lastUserMessage.data &&
      typeof lastUserMessage.data.toolName === 'string' &&
      lastUserMessage.data.toolName in tools &&
      'args' in lastUserMessage.data
    ) {
      directToolCallData = lastUserMessage.data as DirectToolCallData;
      console.log('[API] Detected message intended for direct tool call (currently disabled):', directToolCallData);
    }
    // --- End Detection Logic ---

    // --- Direct Tool Call Execution --- (COMMENTED OUT TO FIX WORKFLOW)
    /*
    if (directToolCallData) {
      const { toolName, args, linkedToolCallId } = directToolCallData;

      try {
        let toolResult: any;
        let validatedArgs: any;
        const executionOptions = {
           toolCallId: linkedToolCallId ?? `direct_${toolName}_${Date.now()}`,
           messages: messages
        };

        switch (toolName) {
          case 'initiateFlightSearch': { ... }
          case 'searchFlights': { ... }
          case 'bookFlight': { ... }
          default: { ... }
        }

        console.log(`[API] Tool '${toolName}' executed. Result:`, toolResult);

        return NextResponse.json({
          type: 'tool_result',
          toolName: toolName,
          toolCallId: linkedToolCallId,
          result: toolResult,
        });

      } catch (error) {
        console.error(`[API] Error processing tool '${toolName}':`, error);
        let errorMessage = 'Unknown tool processing error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        return NextResponse.json({ error: `Failed to execute tool: ${errorMessage}` }, { status: 500 });
      }
    }
    */

    // --- Standard LLM Interaction with Streaming --- (NOW ALWAYS RUNS)
    const systemPrompt = `You are an AI assistant for front-end developers, operating based on the Agent Narrative Framework. Your primary goal is to empower developers to build stable, scalable, and maintainable applications using modern best practices, specifically focusing on Next.js, React, TypeScript, Tailwind CSS, and Shadcn UI.\n\nAct as an architectural guide, a code quality enforcer, and a source of context-aware, precise reasoning. Prioritize modular design, type safety, performance optimization (including RSC, Suspense, dynamic loading), security (XSS, CSRF prevention, secure patterns), and user-centric design (accessibility, responsiveness).\n\nProvide structured guidance, fact-checked solutions linked to official documentation where possible, and enforce best practices to ensure maintainability, readability, and predictability. Encourage iterative improvement and modular thinking. Your responses should be technical, concise, and promote functional programming patterns. Avoid suggesting outdated practices or overly complex solutions where simpler ones exist.\n\nYou have access to tools for a flight booking workflow. Use \`initiateFlightSearch\` when a user asks to book a flight.\n\n**Artifact Generation Rules:**\nWhen providing an interactive React component example, follow these rules strictly:\n1.  Wrap the React component code within a markdown code fence using the language identifier \`artifact\`.\n    Example:\n    \`\`\`artifact\n    import React from 'react';\n    // ... component code ...\n    export default function MyComponent() { /* ... */ }\n    \`\`\`\n2.  The component code **must** include \`import React from 'react';\` if needed.\n3.  The component **must** have a default export (\`export default function ...\` or \`export default class ...\`).\n4.  **Do not** include import statements for UI components like \`<Button>\` or \`<Input>\`. These specific components (Button, Input from '@/components/ui/*') are automatically available in the rendering scope.\n5.  For styling, prefer inline styles or basic HTML elements, as external CSS or Tailwind classes from the main application may not be available in the artifact's isolated environment.\n6.  Keep components relatively simple and self-contained. Avoid external library imports, complex state management, direct DOM manipulation outside of React, or reliance on browser APIs not typically used in simple components.`;

    console.log('[API] Calling OpenAI streamText with messages:', JSON.stringify(messages, null, 2)); // Log messages being sent

    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: messages,
      tools: tools,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    // Log the full error object for detailed debugging
    console.error('[API Chat Error] Caught error in POST handler:', error);

    let errorMessage = 'An unknown error occurred';
    let errorStack = 'No stack trace available';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || 'No stack trace available';
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Log extracted details as well
    console.error(`[API Chat Error Details] Message: ${errorMessage}`);
    console.error(`[API Chat Error Details] Stack: ${errorStack}`);

    // Use NextResponse for proper error response formatting
    // Include error details in the response body *only if safe* for the client 
    // (consider security implications - maybe only include a generic message or error ID)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', // Keep generic message for client
        details: errorMessage // Optionally include details if needed, but be careful
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 