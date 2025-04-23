// lib/types.ts

// Define the possible structures for message content
export type ContentType = 
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'svg'; svg: string }
  | { type: 'mermaid'; syntax: string } // Future placeholder
  | { type: 'python'; code: string; output?: string[] }; // Use string[] for output

// Define our application-specific Message structure
// This might extend or adapt the Vercel AI SDK Message type if needed,
// but for MessageBubble, we primarily care about user/assistant roles
// and our specific content structure.
export interface AppMessage { 
    id: string; 
    role: 'user' | 'assistant'; // Stricter roles for bubble rendering
    content: ContentType;
    createdAt?: Date; // Example: Add other fields your app uses
    // Include other fields from Vercel AI SDK Message if they are needed by MessageBubble or downstream components
    // For example: toolInvocations?: any[]; 
}

// You might also want general types here, e.g.:
export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  userId: string; // Or relevant identifier
  // other chat metadata
} 