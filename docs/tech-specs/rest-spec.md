# REST API Technical Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- REST API Design Principles: Line ~40
  - Resource-Oriented Architecture: Line ~50
  - HTTP Methods: Line ~70
  - URL Structure: Line ~90
  - Status Codes: Line ~110
- Request and Response Formats: Line ~140
  - Content Types: Line ~150
  - Request Format: Line ~170
  - Response Format: Line ~190
- Authentication and Authorization: Line ~230
  - Authentication Methods: Line ~240
  - Authorization: Line ~300
- Rate Limiting: Line ~340
- Versioning Strategy: Line ~380
- API Documentation: Line ~410
- Implementation in Next.js: Line ~450
- Testing Strategy: Line ~500
- Performance Considerations: Line ~540
- Security Best Practices: Line ~570
- Monitoring and Observability: Line ~600

## References

- [REST API Design Best Practices](https://restfulapi.net/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JSON:API Specification](https://jsonapi.org/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Overview

This document provides a technical overview of our REST API implementation, Our REST API serves as the communication layer between client applications and server-side resources, enabling standardized data exchange and operation execution.

## REST API Design Principles

### Resource-Oriented Architecture

Our API follows a resource-oriented approach, where:

- URLs represent resources (nouns), not actions
- HTTP methods represent operations on resources
- Resources are organized hierarchically where appropriate
- Relationships between resources are represented through nested routes

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve a resource or collection | Yes | Yes |
| POST | Create a new resource | No | No |
| PUT | Replace a resource completely | Yes | No |
| PATCH | Update a resource partially | Yes | No |
| DELETE | Remove a resource | Yes | No |

### URL Structure

```
https://api.example.com/v1/{resource}/{resourceId}/{subresource}/{subresourceId}
```

Examples:
- `GET /v1/queries` - List all research queries
- `GET /v1/queries/123` - Get a specific research query
- `POST /v1/queries` - Create a new research query
- `PUT /v1/queries/123` - Replace a research query
- `PATCH /v1/queries/123` - Update a research query
- `DELETE /v1/queries/123` - Delete a research query
- `GET /v1/queries/123/sources` - List sources for a specific query
- `POST /v1/queries/123/sources` - Add a source to a specific query

### Status Codes

Following the **Logos** principle of the Agent Narrative Framework, we use appropriate HTTP status codes:

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH, or DELETE |
| 201 | Created | Successful POST that created a resource |
| 204 | No Content | Successful operation with no response body |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authentication succeeded but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Request conflicts with current state |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

## Request and Response Formats

### Content Types

- `application/json` is the primary content type for request and response bodies
- `multipart/form-data` is used for file uploads
- `application/x-www-form-urlencoded` is supported for simple form submissions

### Request Format

#### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-API-Version: 1.0
```

#### Query Parameters

- `fields`: Specify which fields to include in the response
- `sort`: Specify sorting order (e.g., `sort=createdAt:desc`)
- `filter`: Filter results (e.g., `filter[status]=published`)
- `page`: Pagination page number
- `limit`: Number of items per page

#### Body (for POST, PUT, PATCH)

```json
{
  "title": "Impact of AI on Healthcare",
  "description": "Exploring how artificial intelligence is transforming healthcare delivery and outcomes",
  "status": "draft",
  "tags": ["ai", "healthcare", "technology"]
}
```

### Response Format

#### Success Response

```json
{
  "data": {
    "id": "123",
    "type": "query",
    "attributes": {
      "title": "Impact of AI on Healthcare",
      "description": "Exploring how artificial intelligence is transforming healthcare delivery and outcomes",
      "status": "draft",
      "tags": ["ai", "healthcare", "technology"],
      "createdAt": "2023-06-15T10:30:00Z",
      "updatedAt": "2023-06-15T10:30:00Z"
    },
    "relationships": {
      "user": {
        "data": { "id": "456", "type": "user" }
      },
      "sources": {
        "data": []
      }
    }
  },
  "meta": {
    "requestId": "req-123456"
  }
}
```

#### Collection Response

```json
{
  "data": [
    {
      "id": "123",
      "type": "query",
      "attributes": {
        "title": "Impact of AI on Healthcare",
        "status": "draft",
        "createdAt": "2023-06-15T10:30:00Z"
      }
    },
    {
      "id": "124",
      "type": "query",
      "attributes": {
        "title": "Machine Learning Applications",
        "status": "published",
        "createdAt": "2023-06-14T09:15:00Z"
      }
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "links": {
    "self": "/v1/queries?page=1&limit=10",
    "first": "/v1/queries?page=1&limit=10",
    "prev": null,
    "next": "/v1/queries?page=2&limit=10",
    "last": "/v1/queries?page=5&limit=10"
  }
}
```

#### Error Response

```json
{
  "errors": [
    {
      "status": "400",
      "code": "VALIDATION_ERROR",
      "title": "Validation Error",
      "detail": "The title field is required",
      "source": {
        "pointer": "/data/attributes/title"
      }
    }
  ],
  "meta": {
    "requestId": "req-123456"
  }
}
```

## Authentication and Authorization

Following the **Security Principles** from the **Agent Narrative Framework**:

### Authentication Methods

#### Bearer Token Authentication

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  // Extract token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { errors: [{ status: '401', code: 'UNAUTHORIZED', title: 'Unauthorized' }] },
      { status: 401 }
    );
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const payload = await verifyToken(token);
    
    // Add user info to request context
    const requestWithUser = new Request(req.url, {
      headers: req.headers,
      method: req.method,
      body: req.body,
      signal: req.signal,
    });
    requestWithUser.headers.set('X-User-ID', payload.sub);
    requestWithUser.headers.set('X-User-Role', payload.role);
    
    return NextResponse.next({
      request: requestWithUser,
    });
  } catch (error) {
    return NextResponse.json(
      { errors: [{ status: '401', code: 'INVALID_TOKEN', title: 'Invalid token' }] },
      { status: 401 }
    );
  }
}
```

#### API Key Authentication

For service-to-service communication:

```
X-API-Key: api_key_123456
```

Implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (!apiKey) {
    return NextResponse.json(
      { errors: [{ status: '401', code: 'UNAUTHORIZED', title: 'Unauthorized' }] },
      { status: 401 }
    );
  }
  
  try {
    // Validate API key
    const serviceInfo = await validateApiKey(apiKey);
    
    // Add service info to request context
    const requestWithService = new Request(req.url, {
      headers: req.headers,
      method: req.method,
      body: req.body,
      signal: req.signal,
    });
    requestWithService.headers.set('X-Service-ID', serviceInfo.id);
    requestWithService.headers.set('X-Service-Permissions', serviceInfo.permissions.join(','));
    
    return NextResponse.next({
      request: requestWithService,
    });
  } catch (error) {
    return NextResponse.json(
      { errors: [{ status: '401', code: 'INVALID_API_KEY', title: 'Invalid API key' }] },
      { status: 401 }
    );
  }
}
```

### Authorization

Following the **Ethos** principle of the Agent Narrative Framework, we implement role-based access control (RBAC):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function requirePermission(permission: string) {
  return async function(req: NextRequest) {
    const userRole = req.headers.get('X-User-Role');
    const hasPermission = await checkPermission(userRole, permission);
    
    if (!hasPermission) {
      return NextResponse.json(
        { errors: [{ status: '403', code: 'FORBIDDEN', title: 'Insufficient permissions' }] },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}

// Usage in route handler
export const GET = [
  requirePermission('queries:read'),
  async (req: NextRequest) => {
    // Handle request
  }
];
```

## Rate Limiting

To prevent abuse and ensure fair usage, we implement rate limiting:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(req: NextRequest) {
  // Identify client by IP or token
  const identifier = req.headers.get('X-User-ID') || req.ip || 'anonymous';
  
  // Define limits based on endpoint and user role
  const userRole = req.headers.get('X-User-Role') || 'anonymous';
  const limits = {
    'anonymous': { window: '1m', max: 30 },
    'user': { window: '1m', max: 60 },
    'admin': { window: '1m', max: 120 },
  };
  
  const { window, max } = limits[userRole] || limits['anonymous'];
  
  try {
    // Check rate limit
    await rateLimit.check(identifier, window, max);
    return NextResponse.next();
  } catch (error) {
    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', max.toString());
    headers.set('X-RateLimit-Remaining', '0');
    headers.set('X-RateLimit-Reset', error.resetTime.toString());
    
    return NextResponse.json(
      { errors: [{ status: '429', code: 'RATE_LIMIT_EXCEEDED', title: 'Too many requests' }] },
      { status: 429, headers }
    );
  }
}
```

## Versioning Strategy

Following the **Mythos** principle of the Agent Narrative Framework, we implement a robust versioning strategy:

### URL-Based Versioning

```
https://api.example.com/v1/queries
https://api.example.com/v2/queries
```

### Header-Based Versioning

```
X-API-Version: 1.0
```

### Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Extract version from URL or header
  const urlVersion = req.nextUrl.pathname.match(/^\/v(\d+)\//)?.[1];
  const headerVersion = req.headers.get('X-API-Version');
  
  // Determine which version to use (URL takes precedence)
  const version = urlVersion || headerVersion || '1';
  
  // Validate version
  if (!isValidVersion(version)) {
    return NextResponse.json(
      { errors: [{ status: '400', code: 'INVALID_VERSION', title: 'Invalid API version' }] },
      { status: 400 }
    );
  }
  
  // Add version to request context
  const requestWithVersion = new Request(req.url, {
    headers: req.headers,
    method: req.method,
    body: req.body,
    signal: req.signal,
  });
  requestWithVersion.headers.set('X-Internal-API-Version', version);
  
  return NextResponse.next({
    request: requestWithVersion,
  });
}

// In route handler
export async function GET(req: NextRequest) {
  const version = req.headers.get('X-Internal-API-Version');
  
  // Handle request based on version
  if (version === '1') {
    return handleV1Request(req);
  } else if (version === '2') {
    return handleV2Request(req);
  }
}
```

## API Documentation

Following the **Pathos** principle of the Agent Narrative Framework, we provide comprehensive API documentation:

### OpenAPI Specification

We use OpenAPI 3.0 to document our API:

```yaml
openapi: 3.0.0
info:
  title: Research Assistant API
  version: 1.0.0
  description: API for the AI Research Assistant application
servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server
paths:
  /queries:
    get:
      summary: List research queries
      description: Retrieve a paginated list of research queries
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QueriesResponse'
    post:
      summary: Create a research query
      description: Create a new research query
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QueryInput'
      responses:
        '201':
          description: Query created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QueryResponse'
components:
  schemas:
    Query:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, published, archived]
        tags:
          type: array
          items:
            type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    # Additional schema definitions
```

### API Documentation Generation

We automatically generate API documentation from our OpenAPI specification:

```typescript
import { generateDocs } from '@/lib/openapi';

// Generate OpenAPI specification from route handlers
const openApiSpec = generateDocs();

// Serve OpenAPI specification
export async function GET(req: NextRequest) {
  return NextResponse.json(openApiSpec);
}
```

## Implementation in Next.js

### API Route Structure

Following the **Operational Directives** for code implementation standards:

```
app/
└── api/
    └── v1/
        ├── queries/
        │   ├── route.ts                # GET, POST /api/v1/queries
        │   └── [id]/
        │       ├── route.ts            # GET, PUT, PATCH, DELETE /api/v1/queries/:id
        │       └── sources/
        │           ├── route.ts        # GET, POST /api/v1/queries/:id/sources
        │           └── [sourceId]/
        │               └── route.ts    # GET, PUT, PATCH, DELETE /api/v1/queries/:id/sources/:sourceId
        └── users/
            ├── route.ts                # GET, POST /api/v1/users
            └── [id]/
                └── route.ts            # GET, PUT, PATCH, DELETE /api/v1/users/:id
```

### Route Handler Implementation

```typescript
// app/api/v1/queries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Input validation schema
const QueryInputSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

// GET /api/v1/queries
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { errors: [{ status: '401', code: 'UNAUTHORIZED', title: 'Unauthorized' }] },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sort = url.searchParams.get('sort') || 'createdAt:desc';
    
    // Get filters
    const filters: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key.startsWith('filter[') && key.endsWith(']')) {
        const filterKey = key.slice(7, -1);
        filters[filterKey] = value;
      }
    }
    
    // Query database
    const [sortField, sortDirection] = sort.split(':');
    const result = await db.collection('queries').find({
      ...filters,
      userId: session.user.id,
    })
      .sort(sortField, sortDirection === 'desc' ? -1 : 1)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('queries').countDocuments({
      ...filters,
      userId: session.user.id,
    });
    
    // Format response
    const data = result.map(item => ({
      id: item._id.toString(),
      type: 'query',
      attributes: {
        title: item.title,
        description: item.description,
        status: item.status,
        tags: item.tags,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    }));
    
    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      links: {
        self: `/v1/queries?page=${page}&limit=${limit}`,
        first: `/v1/queries?page=1&limit=${limit}`,
        prev: page > 1 ? `/v1/queries?page=${page - 1}&limit=${limit}` : null,
        next: page < Math.ceil(total / limit) ? `/v1/queries?page=${page + 1}&limit=${limit}` : null,
        last: `/v1/queries?page=${Math.ceil(total / limit)}&limit=${limit}`,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { errors: [{ status: '500', code: 'INTERNAL_ERROR', title: 'Internal server error' }] },
      { status: 500 }
    );
  }
}

// POST /api/v1/queries
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { errors: [{ status: '401', code: 'UNAUTHORIZED', title: 'Unauthorized' }] },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = QueryInputSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        status: '422',
        code: 'VALIDATION_ERROR',
        title: 'Validation Error',
        detail: err.message,
        source: {
          pointer: `/data/attributes/${err.path.join('/')}`,
        },
      }));
      
      return NextResponse.json({ errors }, { status: 422 });
    }
    
    // Create record
    const data = {
      ...validationResult.data,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.collection('queries').insertOne(data);
    
    // Format response
    return NextResponse.json({
      data: {
        id: result.insertedId.toString(),
        type: 'query',
        attributes: {
          ...validationResult.data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        relationships: {
          user: {
            data: { id: session.user.id, type: 'user' },
          },
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { errors: [{ status: '500', code: 'INTERNAL_ERROR', title: 'Internal server error' }] },
      { status: 500 }
    );
  }
}
```

## Testing Strategy

Following the **Agent Narrative Framework's** emphasis on code quality:

### Unit Tests

```typescript
// Testing route handlers
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db');

describe('Queries API', () => {
  beforeEach(() => {
    // Mock authentication
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user123' },
    });
  });
  
  describe('GET /api/v1/queries', () => {
    it('should return paginated queries', async () => {
      // Arrange
      const req = new NextRequest('https://example.com/api/v1/queries?page=1&limit=10');
      
      // Mock database response
      const mockQueries = [
        {
          _id: 'query123',
          title: 'Test Query',
          status: 'draft',
          tags: ['test'],
          userId: 'user123',
          createdAt: '2023-06-15T10:30:00Z',
          updatedAt: '2023-06-15T10:30:00Z',
        },
      ];
      
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue(mockQueries),
          }),
          countDocuments: jest.fn().mockResolvedValue(1),
        }),
      };
      
      global.db = mockDb;
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe('query123');
      expect(data.meta.total).toBe(1);
    });
  });
  
  // Similar tests for POST, PUT/PATCH, and DELETE
});
```

### Integration Tests

```typescript
// Testing API endpoints with supertest
import request from 'supertest';
import { createServer } from '@/test/utils/server';

describe('Queries API Integration', () => {
  let server;
  let token;
  
  beforeAll(async () => {
    server = await createServer();
    
    // Get authentication token
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    token = loginResponse.body.token;
  });
  
  it('should create a new query', async () => {
    const response = await request(server)
      .post('/api/v1/queries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Query',
        description: 'Test description',
        status: 'draft',
        tags: ['test'],
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.attributes.title).toBe('Test Query');
  });
  
  // Similar tests for GET, PUT/PATCH, and DELETE endpoints
});
```

## Performance Considerations

- Implement response compression
- Use HTTP/2 for multiplexing requests
- Implement efficient pagination for large collections
- Consider caching strategies (ETags, Cache-Control headers)
- Use connection pooling for database connections
- Implement request timeout handling
- Monitor and optimize slow endpoints

## Security Best Practices

Following the **Security Principles** from the **Agent Narrative Framework**:

- Use HTTPS for all API endpoints
- Implement proper authentication and authorization
- Validate all input data
- Implement rate limiting and throttling
- Use parameterized queries to prevent injection attacks
- Set appropriate CORS headers
- Implement proper error handling without leaking sensitive information
- Use security headers (Content-Security-Policy, X-Content-Type-Options, etc.)
- Implement API key rotation policies
- Log all security-relevant events

## Monitoring and Observability

- Implement request logging with correlation IDs
- Track API usage metrics (requests per endpoint, response times, error rates)
- Set up alerts for unusual patterns or error spikes
- Implement distributed tracing for complex requests
- Monitor rate limit usage and adjust as needed

## References

- [REST API Design Best Practices](https://restfulapi.net/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JSON:API Specification](https://jsonapi.org/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)