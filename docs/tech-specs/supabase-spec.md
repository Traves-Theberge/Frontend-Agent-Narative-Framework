# Supabase Technical Specification

## Overview

This document provides a technical overview of our Supabase implementation, following the **Agent Narrative Framework** principles. Supabase serves as our serverless backend platform, providing PostgreSQL database, authentication, storage, and real-time capabilities to power our applications with minimal configuration.

## Supabase Core Components

### PostgreSQL Database

Our implementation leverages Supabase's PostgreSQL database as the primary data store:

- **Full PostgreSQL compatibility** with all features and extensions
- **Row-Level Security (RLS)** for fine-grained access control
- **Database triggers** for automated workflows
- **Foreign key relationships** for data integrity
- **JSON support** for flexible data structures
- **Full-text search** capabilities
- **Vector support** for AI and machine learning applications

### Authentication System

Following the **Security Principles** from the **Agent Narrative Framework**:

| Authentication Method | Description | Implementation |
|----------------------|-------------|----------------|
| Email/Password | Traditional authentication with secure password hashing | Default implementation |
| Magic Link | Passwordless authentication via email links | Enabled for frictionless login |
| Social OAuth | Authentication via third-party providers | Configured for Google, GitHub, and Microsoft |
| Phone Auth | SMS-based authentication | Available but not enabled by default |
| Multi-factor Authentication | Additional security layer | Enabled for sensitive operations |

### Storage

Supabase Storage provides a secure and scalable solution for file management:

- **S3-compatible API** for file operations
- **Row-Level Security** for file access control
- **Image transformations** for resizing and optimization
- **CDN integration** for fast content delivery
- **Public and private buckets** for different access patterns

### Realtime

Realtime capabilities enable building interactive and collaborative features:

- **Database changes** for syncing data across clients
- **Presence** for tracking user online status
- **Broadcast** for sending messages to multiple clients
- **Channel-based subscriptions** for targeted updates

### Edge Functions

Serverless functions deployed globally for backend logic:

- **Deno runtime** for TypeScript/JavaScript execution
- **Global deployment** for low-latency responses
- **Webhook support** for third-party integrations
- **Secure environment variables** for configuration

## Implementation in Next.js

### Database Access

Following the **Operational Directives** for code implementation standards:

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Server-side Supabase client for Server Components
export const getServerSupabase = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
```

### Authentication Implementation

```typescript
// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Redirect handled by middleware
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // Show success message
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI implementation with TailwindCSS
    // Form fields and buttons for authentication
  );
}
```

### Middleware for Auth Protection

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes pattern
  const protectedRoutes = ['/dashboard', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Auth routes pattern
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirect logic
  if (isProtectedRoute && !session) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isAuthRoute && session) {
    // Redirect to dashboard if accessing auth routes with active session
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Auth routes
    '/auth/:path*',
  ],
};
```

### Database Operations

```typescript
// app/api/queries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Input validation schema
const QueryInputSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

// GET /api/queries
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Authenticate user
    const { data: { session } } = await supabase.auth.getSession();
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
    const sort = url.searchParams.get('sort') || 'created_at:desc';
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Parse sort parameters
    const [sortField, sortDirection] = sort.split(':');
    
    // Query database
    const { data, error, count } = await supabase
      .from('queries')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order(sortField, { ascending: sortDirection !== 'desc' })
      .range(from, to);
    
    if (error) throw error;
    
    // Format response
    return NextResponse.json({
      data: data.map(item => ({
        id: item.id,
        type: 'query',
        attributes: {
          title: item.title,
          description: item.description,
          status: item.status,
          tags: item.tags,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      })),
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      links: {
        self: `/api/queries?page=${page}&limit=${limit}`,
        first: `/api/queries?page=1&limit=${limit}`,
        prev: page > 1 ? `/api/queries?page=${page - 1}&limit=${limit}` : null,
        next: page < Math.ceil((count || 0) / limit) ? `/api/queries?page=${page + 1}&limit=${limit}` : null,
        last: `/api/queries?page=${Math.ceil((count || 0) / limit)}&limit=${limit}`,
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { errors: [{ status: '500', code: 'INTERNAL_ERROR', title: 'Internal server error', detail: error.message }] },
      { status: 500 }
    );
  }
}

// POST /api/queries
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Authenticate user
    const { data: { session } } = await supabase.auth.getSession();
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
    
    // Insert record
    const { data, error } = await supabase
      .from('queries')
      .insert({
        ...validationResult.data,
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Format response
    return NextResponse.json({
      data: {
        id: data.id,
        type: 'query',
        attributes: {
          title: data.title,
          description: data.description,
          status: data.status,
          tags: data.tags,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        relationships: {
          user: {
            data: { id: session.user.id, type: 'user' },
          },
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { errors: [{ status: '500', code: 'INTERNAL_ERROR', title: 'Internal server error', detail: error.message }] },
      { status: 500 }
    );
  }
}
```

### Storage Implementation

```typescript
// app/api/storage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Authenticate user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { errors: [{ status: '401', code: 'UNAUTHORIZED', title: 'Unauthorized' }] },
        { status: 401 }
      );
    }
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'public';
    const path = formData.get('path') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { errors: [{ status: '400', code: 'BAD_REQUEST', title: 'No file provided' }] },
        { status: 400 }
      );
    }
    
    // Upload file
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(`${path}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(`${path}/${file.name}`);
    
    // Format response
    return NextResponse.json({
      data: {
        id: data.path,
        type: 'file',
        attributes: {
          path: data.path,
          bucket,
          publicUrl,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { errors: [{ status: '500', code: 'INTERNAL_ERROR', title: 'Internal server error', detail: error.message }] },
      { status: 500 }
    );
  }
}
```

### Realtime Implementation

```typescript
// components/RealtimeQueries.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type Query = Database['public']['Tables']['queries']['Row'];

export default function RealtimeQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  
  useEffect(() => {
    // Initial fetch
    const fetchQueries = async () => {
      const { data } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setQueries(data);
    };
    
    fetchQueries();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queries',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setQueries(prev => [payload.new as Query, ...prev]);
              break;
            case 'UPDATE':
              setQueries(prev => 
                prev.map(query => 
                  query.id === payload.new.id ? payload.new as Query : query
                )
              );
              break;
            case 'DELETE':
              setQueries(prev => 
                prev.filter(query => query.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Realtime Queries</h2>
      <ul className="divide-y divide-gray-200">
        {queries.map(query => (
          <li key={query.id} className="py-4">
            <h3 className="font-medium">{query.title}</h3>
            <p className="text-gray-600">{query.description}</p>
            <div className="flex gap-2 mt-2">
              {query.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Database Schema Design

Following the **Logos** principle of the Agent Narrative Framework, we design our database schema with clarity and purpose:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (managed by Supabase Auth)
-- This references the auth.users table created by Supabase

-- Profiles table (public user data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Queries table (research queries)
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sources table (research sources)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  summary TEXT,
  query_id UUID REFERENCES queries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security Policies
-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Queries: Users can CRUD their own queries
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queries"
  ON queries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queries"
  ON queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queries"
  ON queries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queries"
  ON queries FOR DELETE
  USING (auth.uid() = user_id);

-- Sources: Users can CRUD their own sources
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sources"
  ON sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON sources FOR DELETE
  USING (auth.uid() = user_id);

-- Functions and Triggers
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## TypeScript Type Definitions

Following the **Operational Directives** for type safety:

```typescript
// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      queries: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'archived'
          tags: string[]
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: 'draft' | 'published' | 'archived'
          tags?: string[]
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'archived'
          tags?: string[]
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sources: {
        Row: {
          id: string
          title: string
          url: string | null
          content: string | null
          summary: string | null
          query_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url?: string | null
          content?: string | null
          summary?: string | null
          query_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string | null
          content?: string | null
          summary?: string | null
          query_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_query_id_fkey"
            columns: ["query_id"]
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sources_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

## Security Best Practices

Following the **Security Principles** from the **Agent Narrative Framework**:

- **Environment Variables**: Store Supabase credentials securely in environment variables
- **Row-Level Security**: Implement RLS policies for all tables
- **JWT Validation**: Validate JWT tokens on the server side
- **HTTPS**: Use HTTPS for all API endpoints
- **Content Security Policy**: Implement CSP headers
- **API Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: Validate all user inputs with Zod or similar
- **Audit Logging**: Log security-relevant events
- **Regular Security Audits**: Conduct regular security audits
- **Least Privilege**: Follow the principle of least privilege for database access

## Performance Considerations

- **Connection Pooling**: Use connection pooling for database connections
- **Indexing**: Create appropriate indexes for frequently queried columns
- **Query Optimization**: Optimize database queries for performance
- **Caching**: Implement caching for frequently accessed data
- **Edge Functions**: Use Edge Functions for low-latency operations
- **CDN**: Use CDN for static assets and Storage files
- **Pagination**: Implement efficient pagination for large collections
- **Batch Operations**: Use batch operations for multiple database operations

## Testing Strategy

```typescript
// __tests__/api/queries.test.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/queries/route';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => mockSupabaseClient),
}));

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

describe('Queries API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user123' },
        },
      },
    });
  });
  
  describe('GET /api/queries', () => {
    it('should return paginated queries', async () => {
      // Arrange
      const req = new NextRequest('https://example.com/api/queries?page=1&limit=10');
      
      // Mock database response
      mockSupabaseClient.select.mockReturnValue({
        data: [
          {
            id: 'query123',
            title: 'Test Query',
            description: 'Test description',
            status: 'draft',
            tags: ['test'],
            user_id: 'user123',
            created_at: '2023-06-15T10:30:00Z',
            updated_at: '2023-06-15T10:30:00Z',
          },
        ],
        error: null,
        count: 1,
      });
      
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

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security in PostgreSQL](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
