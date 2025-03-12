# API Documentation

This directory contains documentation for all API endpoints used in our application, following principles for maintainable, secure, and scalable development.

## API Structure

The application uses the following API routes:

### Authentication API

- `POST /api/auth/signin`: Sign in with credentials or OAuth providers
- `POST /api/auth/signout`: Sign out the current user
- `GET /api/auth/session`: Get the current session information
- `GET /api/auth/csrf`: Get CSRF token for form submissions

### Search API

- `GET /api/search`: Perform a search query
- `GET /api/search/suggestions`: Get search suggestions
- `GET /api/search/history`: Get user's search history

### AI API

- `POST /api/ai/chat`: Generate AI responses
- `POST /api/ai/stream`: Stream AI responses in real-time
- `POST /api/ai/summarize`: Summarize content
- `POST /api/ai/analyze`: Analyze documents or images

### Vector Database API

- `POST /api/vector/index`: Index documents in vector database
- `GET /api/vector/search`: Perform semantic search
- `DELETE /api/vector/documents`: Delete documents from index

## API Implementation with Agent Narrative Framework

Each API endpoint is implemented as a Next.js API route following the **Agent Narrative Framework** principles:

```typescript
// Example API route implementation
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API handler for processing requests
 * 
 * Following Agent Narrative Framework principles:
 * - Type safety (TypeScript)
 * - Proper error handling
 * - Authentication verification
 * - Structured response format
 */
export async function POST(req: NextRequest) {
  // Get session for authentication (Security principle from Ethos)
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse request body with type safety (Logos principle)
    const body = await req.json();
    
    // Process the request
    const result = await processRequest(body);
    
    // Return structured response (Consistency principle from Logos)
    return NextResponse.json(result);
  } catch (error) {
    // Comprehensive error handling (Reliability principle from Ethos)
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Error Handling

All API endpoints follow a consistent error handling pattern aligned with the **Agent Narrative Framework**'s focus on predictability and reliability:

- **400 Bad Request**: Invalid input parameters
- **401 Unauthorized**: Missing authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

## Rate Limiting

API endpoints implement rate limiting to prevent abuse, following the **Security Principles** from the **Agent Narrative Framework**:

```typescript
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await limiter.check(10, ip); // 10 requests per minute per IP
    // Process request
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
}
```

## Authentication and Security

Most API endpoints require authentication using NextAuth.js, implementing the **Security Principles** from the **Agent Narrative Framework**:

- **Data Protection**: Preventing XSS, CSRF, and injection attacks
- **Authentication & Authorization**: Secure RBAC and OAuth implementation
- **Code Hardening**: Enforcing secure patterns and CSP
- **Third-Party Security**: Using audited, actively maintained libraries

## API Documentation Standards

Each API endpoint is documented with the following information, promoting the **Clarity** and **Predictability** principles from the **Agent Narrative Framework**:

1. **Purpose**: What the endpoint does
2. **Request Parameters**: Expected input parameters with TypeScript types
3. **Response Format**: Structure of the response with TypeScript interfaces
4. **Error Codes**: Possible error responses and their meanings
5. **Example Usage**: Code examples for using the endpoint
6. **Security Considerations**: Authentication requirements and security notes

## Using the Agent Narrative Framework in API Development

When developing new API endpoints, follow these guidelines from the **Agent Narrative Framework**:

1. **Assess Requirements**: Ensure a full understanding of the endpoint's purpose
2. **Generate and Explain Solutions**: Provide structured, clear, and DRY-compliant code
3. **Deliver Final Implementation**: Ensure correctness, completeness, and alignment with best practices

### Code Implementation Guidelines

- Use TypeScript for type safety and maintainability
- Follow separation of concerns (SoC)
- Implement comprehensive error handling
- Ensure proper authentication and authorization
- Document all endpoints thoroughly
- Write unit and integration tests for critical endpoints

By following these principles, our API implementation remains secure, maintainable, and developer-friendly. 