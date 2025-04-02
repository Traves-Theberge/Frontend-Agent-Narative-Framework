# Next.js Technical Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Architecture: Line ~40
- Routing System: Line ~50
  - App Router: Line ~60
  - Pages Router: Line ~90
  - Dynamic Routes: Line ~120

### Core Features
- Server Components: Line ~150
- Data Fetching: Line ~180
  - Server-Side Rendering: Line ~190
  - Static Site Generation: Line ~220
  - Incremental Static Regeneration: Line ~250
- API Routes: Line ~280

### Advanced Features
- Middleware: Line ~310
- Edge Runtime: Line ~340
- Image Optimization: Line ~370
- Internationalization: Line ~400

### Performance Optimization
- Caching Strategies: Line ~430
- Bundle Optimization: Line ~460
- Core Web Vitals: Line ~490

### Additional Information
- Deployment: Line ~520

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)
- [React Documentation](https://react.dev/)
- [Vercel Platform](https://vercel.com/docs)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js Learn](https://nextjs.org/learn)
- [Web Vitals](https://web.dev/vitals/)

## Overview

This document provides a technical overview of Next.js, a React framework for building full-stack web applications. Next.js offers a comprehensive solution with built-in features like routing, server-side rendering, API routes, and optimized performance.

## Version and Documentation

- **Next.js Version**: 15.x
- **Documentation**: [Next.js Documentation](https://nextjs.org/docs)
- **GitHub Repository**: [vercel/next.js](https://github.com/vercel/next.js)

## Core Features

### App Router

The App Router is Next.js's recommended routing architecture, built on React Server Components:

- **File-based Routing**: Routes are defined by the file structure in the `app` directory
- **Nested Routes**: Create nested routes with nested folders
- **Dynamic Routes**: Support for dynamic segments with `[param]` syntax
- **Route Groups**: Organize routes without affecting URL structure using `(group)` syntax
- **Parallel Routes**: Render multiple pages in the same layout with `@folder` syntax
- **Intercepting Routes**: Intercept routes for modal or slideout patterns with `(..)` syntax

```jsx
// app/layout.js - Root layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>My App</header>
        {children}
        <footer>© 2024</footer>
      </body>
    </html>
  );
}

// app/page.js - Home page
export default function Home() {
  return <h1>Welcome to Next.js</h1>;
}

// app/blog/[slug]/page.js - Dynamic route
export default function BlogPost({ params }) {
  return <h1>Blog Post: {params.slug}</h1>;
}

// app/(marketing)/about/page.js - Route group
export default function About() {
  return <h1>About Us</h1>;
}

// app/@dashboard/page.js - Parallel route
export default function Dashboard() {
  return <h1>Dashboard</h1>;
}
```

### Rendering Strategies

Next.js supports multiple rendering strategies:

- **Server Components (Default)**: Render on the server with zero JavaScript sent to the client
- **Client Components**: Interactive components rendered on the client
- **Static Site Generation (SSG)**: Pre-render pages at build time
- **Server-Side Rendering (SSR)**: Generate HTML on each request
- **Incremental Static Regeneration (ISR)**: Update static pages after deployment

```jsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}

// Client Component
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Static Site Generation with dynamic routes
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Incremental Static Regeneration
export const revalidate = 60; // Revalidate every 60 seconds
```

### Data Fetching

Next.js provides multiple methods for data fetching:

- **Server Components**: Fetch data directly in Server Components
- **Route Handlers**: Create API endpoints with the `app/api` directory
- **Server Actions**: Mutate data with server-side functions
- **Static Data**: Fetch data at build time with `generateStaticParams`
- **Dynamic Data**: Fetch data on each request
- **Cached Data**: Control caching behavior with the `fetch` API

```jsx
// Data fetching in Server Components
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}

// Route Handler (API endpoint)
// app/api/users/route.js
export async function GET(request) {
  const users = await db.users.findMany();
  return Response.json(users);
}

export async function POST(request) {
  const data = await request.json();
  const user = await db.users.create({ data });
  return Response.json(user);
}

// Server Action
'use server';

export async function createUser(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  
  const user = await db.users.create({
    data: { name, email }
  });
  
  revalidatePath('/users');
  return user;
}
```

### Metadata API

Next.js provides a flexible API for managing metadata:

- **Static Metadata**: Define metadata in a `metadata` object or `generateMetadata` function
- **Dynamic Metadata**: Generate metadata based on route parameters
- **File-based Metadata**: Use special files like `favicon.ico`, `opengraph-image.jpg`
- **JSON-LD**: Add structured data for SEO

```jsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Welcome to my application',
  openGraph: {
    title: 'My App',
    description: 'Welcome to my application',
    images: ['/og-image.jpg'],
  },
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}
```

### Styling Solutions

Next.js supports multiple styling approaches:

- **CSS Modules**: Locally scoped CSS files (`.module.css`)
- **Tailwind CSS**: Utility-first CSS framework with built-in support
- **CSS-in-JS**: Libraries like styled-components or emotion
- **Sass**: Built-in support for `.scss` and `.sass` files
- **Global CSS**: Import global styles in the root layout

```jsx
// CSS Modules
import styles from './Button.module.css';

export default function Button() {
  return <button className={styles.button}>Click me</button>;
}

// Tailwind CSS
export default function Button() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Click me
    </button>
  );
}

// Global CSS (in app/layout.js)
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Image Optimization

Next.js includes an Image component for automatic optimization:

- **Automatic Optimization**: Resize, optimize, and serve images in modern formats
- **Lazy Loading**: Images load as they enter the viewport
- **Responsive Images**: Serve different image sizes based on device
- **Visual Stability**: Prevent layout shift with automatic sizing

```jsx
import Image from 'next/image';

export default function Profile() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile picture"
      width={500}
      height={500}
      priority // Load immediately (for above-the-fold images)
      quality={80} // Quality setting (0-100)
      placeholder="blur" // Show a blur placeholder
      blurDataURL="data:image/jpeg;base64,..." // Base64 encoded placeholder
    />
  );
}

// Remote images
<Image
  src="https://example.com/profile.jpg"
  alt="Profile picture"
  width={500}
  height={500}
  unoptimized={false} // Set to true to disable optimization
/>
```

### Authentication

Next.js works with various authentication solutions:

- **NextAuth.js / Auth.js**: Complete authentication solution
- **Custom Authentication**: Build your own with middleware and cookies
- **Third-party Providers**: Integrate with Auth0, Firebase, Supabase, etc.

```jsx
// Using Auth.js (formerly NextAuth.js)
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify credentials
        const user = await verifyCredentials(credentials);
        return user;
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Client-side usage
'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  
  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

### Middleware

Next.js middleware runs before a request is completed:

- **Route Protection**: Protect routes based on authentication
- **Redirects**: Implement redirects based on conditions
- **Headers**: Add or modify response headers
- **Rewrites**: Rewrite URLs internally
- **Geolocation**: Access user's country or region

```jsx
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    // Check if the user is authenticated
    const token = request.cookies.get('token');
    
    if (!token) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Add headers
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'custom-value');
  
  return response;
}

// Configure which paths should be processed by middleware
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Internationalization (i18n)

Next.js supports internationalization through:

- **Routing**: Locale-aware routing with subpaths or domains
- **Middleware**: Detect user's preferred language
- **Translation Libraries**: Integration with react-intl, next-i18next, etc.

```jsx
// Middleware-based i18n
// middleware.js
import { NextResponse } from 'next/server';

const locales = ['en', 'fr', 'de'];
const defaultLocale = 'en';

export function middleware(request) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) return;
  
  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim())
    .find(lang => locales.includes(lang)) || defaultLocale;
  
  // Redirect to the preferred locale
  return NextResponse.redirect(
    new URL(`/${preferredLocale}${pathname}`, request.url)
  );
}

// Dictionary approach
// app/[lang]/dictionaries.js
const dictionaries = {
  en: () => import('./dictionaries/en.json').then(module => module.default),
  fr: () => import('./dictionaries/fr.json').then(module => module.default),
};

export const getDictionary = async (locale) => {
  return dictionaries[locale]();
};

// Usage in a page
// app/[lang]/page.js
import { getDictionary } from './dictionaries';

export default async function Page({ params: { lang } }) {
  const dict = await getDictionary(lang);
  
  return (
    <div>
      <h1>{dict.welcome}</h1>
      <p>{dict.description}</p>
    </div>
  );
}
```

## Performance Optimization

### Automatic Optimizations

Next.js includes several automatic optimizations:

- **Code Splitting**: Automatically splits code by route
- **Tree Shaking**: Eliminates unused code
- **Image Optimization**: Automatically optimizes images
- **Font Optimization**: Automatically optimizes fonts with `next/font`
- **Script Optimization**: Optimizes third-party scripts with `next/script`

```jsx
// Font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

// Script optimization
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive" // Load after page becomes interactive
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `}
      </Script>
      {children}
    </>
  );
}
```

### Manual Optimizations

Additional optimizations you can implement:

- **Component-level Optimizations**:
  - Use React.memo for pure components
  - Optimize re-renders with useMemo and useCallback
  - Implement virtualization for long lists

- **Data Fetching Optimizations**:
  - Implement proper caching strategies
  - Use Incremental Static Regeneration for dynamic content
  - Implement stale-while-revalidate patterns

- **Bundle Size Optimization**:
  - Analyze bundle with `@next/bundle-analyzer`
  - Implement dynamic imports for large dependencies
  - Use code splitting with `next/dynamic`

```jsx
// Dynamic imports
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable server-side rendering
});

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <DynamicComponent />
    </div>
  );
}

// Bundle analyzer setup
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});
```

## Deployment

Next.js applications can be deployed to various platforms:

- **Vercel**: Zero-configuration deployment (recommended)
- **Self-hosted**: Deploy to your own infrastructure
- **Static Export**: Export as static HTML/CSS/JS
- **Docker**: Containerize your application
- **Serverless**: Deploy to serverless platforms

```bash
# Vercel deployment
vercel

# Static export
next build
next export

# Docker deployment
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./`
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Testing

Next.js supports various testing strategies:

- **Unit Testing**: Test individual components and functions
- **Integration Testing**: Test component interactions
- **End-to-End Testing**: Test complete user flows
- **API Testing**: Test API routes

```jsx
// Unit testing with Jest and React Testing Library
// __tests__/Home.test.js
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { name: /welcome/i });
    
    expect(heading).toBeInTheDocument();
  });
});

// API route testing
// __tests__/api/users.test.js
import { createMocks } from 'node-mocks-http';
import { GET } from '../app/api/users/route';

describe('/api/users', () => {
  it('returns users', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    await GET(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      ])
    );
  });
});

// E2E testing with Playwright
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('should navigate to the about page', async ({ page }) => {
  // Start from the index page
  await page.goto('/');
  
  // Click the about link
  await page.click('text=About');
  
  // The new page should contain an h1 with "About"
  await expect(page.locator('h1')).toContainText('About');
});
```

## Configuration

Next.js is configured through `next.config.js`:

- **Environment Variables**: Configure environment variables
- **Redirects and Rewrites**: Set up URL redirects and rewrites
- **Headers**: Configure HTTP headers
- **Image Optimization**: Configure image domains and formats
- **Webpack**: Customize webpack configuration
- **Transpilation**: Configure transpilation options

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure image domains
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
  
  // Configure rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'",
          },
        ],
      },
    ];
  },
  
  // Customize webpack config
  webpack: (config, { isServer }) => {
    // Custom webpack config
    if (!isServer) {
      // Client-side specific config
    }
    return config;
  },
  
  // Enable experimental features
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

## Best Practices

### Project Structure

Organize your Next.js project for maintainability:

```
my-app/
├── app/                  # App Router
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   ├── globals.css       # Global styles
│   ├── (routes)/         # Route groups
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   └── page.js
│   │   │   └── page.js
│   │   └── about/
│   │       └── page.js
│   └── api/              # API routes
│       └── users/
│           └── route.js
├── components/           # Shared components
│   ├── ui/               # UI components
│   │   ├── Button.jsx
│   │   └── Card.jsx
│   └── features/         # Feature components
│       ├── auth/
│       │   └── LoginForm.jsx
│       └── blog/
│           └── PostCard.jsx
├── lib/                  # Utility functions
│   ├── db.js             # Database client
│   └── utils.js          # Helper functions
├── public/               # Static assets
│   ├── images/
│   └── favicon.ico
├── styles/               # Component styles
│   └── Button.module.css
├── .env.local            # Local environment variables
├── .env.example          # Example environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

### Performance Checklist

Ensure optimal performance with these practices:

- Use Server Components for non-interactive UI
- Implement proper data fetching strategies with caching
- Optimize images with the Image component
- Implement code splitting with dynamic imports
- Use the Font component for web fonts
- Implement proper error boundaries
- Use Suspense for loading states
- Analyze and optimize bundle size

### Security Checklist

Implement these security best practices:

- Set proper Content Security Policy headers
- Implement proper authentication and authorization
- Validate and sanitize user inputs
- Use HTTPS in production
- Implement proper CORS policies
- Keep dependencies updated
- Use environment variables for sensitive information
- Implement rate limiting for API routes