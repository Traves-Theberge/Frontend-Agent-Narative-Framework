# NextAuth.js Technical Specification

## Overview

This document provides a technical overview of NextAuth.js implementation within our application. NextAuth.js is a complete authentication solution for Next.js applications, providing a secure, flexible, and developer-friendly way to add authentication to React applications.

## Version and Resources

- **Version**: NextAuth.js 5.x (for Next.js 14+)
- **Documentation**: [NextAuth.js Documentation](https://next-auth.js.org/)
- **GitHub Repository**: [NextAuth.js GitHub](https://github.com/nextauthjs/next-auth)

## Core Features

- **Authentication Providers**: Support for OAuth, email/password, and custom credential providers
- **Session Management**: Secure JWT or database sessions with configurable strategies
- **TypeScript Support**: Full type definitions for enhanced developer experience
- **Middleware Support**: Route protection and session validation
- **Callbacks and Events**: Extensible authentication lifecycle hooks
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Database Adapters**: Support for various database systems

## Implementation

### Installation

```bash
npm install next-auth@beta
```

### Basic Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
```

```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await authenticateUser(email, password);
          if (!user) return null;
          
          return user;
        }
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }
      
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

async function authenticateUser(email: string, password: string) {
  // Implementation of user authentication logic
  // This would typically involve checking credentials against a database
}
```

### Middleware for Route Protection

```typescript
// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                           nextUrl.pathname.startsWith('/profile');
  const isAuthRoute = nextUrl.pathname.startsWith('/auth');

  // Redirect unauthenticated users to login page
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/login', nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Client-Side Authentication

```tsx
// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form data
      const validatedData = loginSchema.parse({ email, password });
      
      // Attempt to sign in
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Session Provider

```tsx
// app/providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Using Authentication in Components

```tsx
// app/components/UserProfile.tsx
'use client';

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div>You must be signed in to view this page</div>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Signed in as {session?.user?.email}</p>
      {/* Additional user profile information */}
    </div>
  );
}
```

### Server-Side Authentication

```tsx
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      {/* Dashboard content */}
    </div>
  );
}
```

## Authentication Providers

### OAuth Providers

```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      // Credentials configuration as shown earlier
    }),
  ],
  // Other configuration options
};
```

### Email Provider

```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Email from "next-auth/providers/email";

export const authConfig: NextAuthConfig = {
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  // Other configuration options
};
```

## Database Integration

### Using a Database Adapter

```typescript
// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
});
```

### Database Schema (Prisma Example)

```prisma
// prisma/schema.prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Advanced Features

### Custom Callbacks

```typescript
// auth.config.ts
export const authConfig: NextAuthConfig = {
  callbacks: {
    // Customize JWT token
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Add access token from OAuth provider
      if (account) {
        token.accessToken = account.access_token;
      }
      
      return token;
    },
    
    // Customize session object
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    
    // Control redirect behavior
    redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirects to the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Redirect to base URL for all other cases
      return baseUrl;
    },
  },
};
```

### Event Handling

```typescript
// auth.config.ts
export const authConfig: NextAuthConfig = {
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Handle successful sign in
      if (isNewUser) {
        // Create user profile or send welcome email
        await createUserProfile(user);
      }
      
      // Log sign in event
      await logAuthEvent({
        type: 'signIn',
        userId: user.id,
        provider: account?.provider,
      });
    },
    async signOut({ session, token }) {
      // Handle sign out
      await logAuthEvent({
        type: 'signOut',
        userId: token.id as string,
      });
    },
    async createUser({ user }) {
      // Handle user creation
      await sendWelcomeEmail(user.email);
    },
    async linkAccount({ user, account, profile }) {
      // Handle account linking
    },
    async session({ session, token }) {
      // Handle session update
    },
  },
};
```

### Role-Based Access Control

```typescript
// lib/auth.ts
import { auth } from "@/auth";

export async function hasRole(requiredRole: string) {
  const session = await auth();
  return session?.user?.role === requiredRole;
}

export async function isAdmin() {
  return hasRole('admin');
}

// Usage in a server component
export default async function AdminPage() {
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Client-Side Role Check

```tsx
// components/RoleGate.tsx
'use client';

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface RoleGateProps {
  allowedRole: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGate({ 
  allowedRole, 
  children, 
  fallback = <div>Access denied</div> 
}: RoleGateProps) {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated" || session?.user?.role !== allowedRole) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Usage
<RoleGate allowedRole="admin">
  <AdminPanel />
</RoleGate>
```

## Security Considerations

### Environment Variables

```env
# .env.local
NEXTAUTH_URL=https://example.com
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars

# OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email provider
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-user
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com
```

### CSRF Protection

NextAuth.js includes built-in CSRF protection. For additional security:

```typescript
// auth.config.ts
export const authConfig: NextAuthConfig = {
  // Other configuration
  cookies: {
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    // Other cookie configurations
  },
};
```

### JWT Configuration

```typescript
// auth.config.ts
export const authConfig: NextAuthConfig = {
  // Other configuration
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secret: process.env.NEXTAUTH_SECRET,
  },
};
```

## Testing

### Unit Testing Authentication Logic

```typescript
// __tests__/auth.test.ts
import { authenticateUser } from "@/lib/auth";
import { prismaMock } from "@/test/prisma-mock";
import { hash } from "bcrypt";

describe("Authentication", () => {
  test("authenticateUser returns user for valid credentials", async () => {
    const hashedPassword = await hash("password123", 10);
    
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "user",
    };
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    
    const result = await authenticateUser("test@example.com", "password123");
    
    expect(result).toEqual({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    });
  });
  
  test("authenticateUser returns null for invalid credentials", async () => {
    const hashedPassword = await hash("password123", 10);
    
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "user",
    };
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    
    const result = await authenticateUser("test@example.com", "wrongpassword");
    
    expect(result).toBeNull();
  });
});
```

### Integration Testing with Authentication

```typescript
// __tests__/protected-route.test.ts
import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import ProtectedPage from "@/app/protected/page";

// Mock the next-auth/react module
jest.mock("next-auth/react");

describe("Protected Page", () => {
  test("shows loading state when session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });
    
    render(<ProtectedPage />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
  
  test("shows content when user is authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: "fake-date",
      },
      status: "authenticated",
    });
    
    render(<ProtectedPage />);
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
  
  test("redirects when user is not authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    
    render(<ProtectedPage />);
    
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Secure Environment Variables**: Store all sensitive information in environment variables and never commit them to version control.

2. **Use HTTPS**: Always use HTTPS in production to protect authentication tokens and cookies.

3. **Implement Proper Error Handling**: Provide user-friendly error messages without exposing sensitive information.

4. **Validate User Input**: Always validate user input on both client and server sides.

5. **Use Strong Password Policies**: Enforce strong password requirements for credential providers.

6. **Implement Rate Limiting**: Protect authentication endpoints from brute force attacks.

7. **Regular Security Audits**: Regularly audit your authentication implementation for security vulnerabilities.

8. **Keep Dependencies Updated**: Regularly update NextAuth.js and related dependencies to benefit from security patches.

9. **Implement Multi-Factor Authentication**: For sensitive applications, consider implementing MFA.

10. **Follow the Principle of Least Privilege**: Only grant users the minimum permissions they need.

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [OWASP Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-jwt-bcp-07)
- [OAuth 2.0 Security Best Practices](https://oauth.net/2/security-best-practices/) 