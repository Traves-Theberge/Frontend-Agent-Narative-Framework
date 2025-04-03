# SEO Technical Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- SEO Core Components: Line ~40
  - Metadata Management: Line ~50
  - Structured Data: Line ~80
  - Technical SEO Elements: Line ~110
  - Advanced SEO Features: Line ~140

### Implementation
- Metadata Implementation: Line ~170
- Dynamic Metadata for Pages: Line ~220
- Structured Data Implementation: Line ~270
- XML Sitemap Generation: Line ~320
- Robots.txt Implementation: Line ~360

### Best Practices
- Content Optimization: Line ~390
- Technical Optimization: Line ~420
- Image Optimization: Line ~450
- Performance Optimization: Line ~480
- Monitoring and Analytics: Line ~520
- Testing Strategy: Line ~550

## References

- [Next.js Documentation - Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Documentation - SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/docs/schemas.html)
- [Google Search Central Documentation](https://developers.google.com/search/docs)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

## Overview

This document provides a technical overview of our Search Engine Optimization (SEO) implementation, Our SEO strategy serves as the foundation for ensuring our applications are discoverable, indexable, and rankable by search engines, driving organic traffic and improving user acquisition.

## SEO Core Components

### Metadata Management

Our implementation leverages Next.js's built-in metadata capabilities:

- **Page titles** - Concise, keyword-rich titles under 60 characters
- **Meta descriptions** - Compelling summaries between 150-160 characters
- **Canonical URLs** - Proper URL consolidation to prevent duplicate content issues
- **Open Graph metadata** - Rich social sharing previews
- **Twitter Cards** - Enhanced Twitter sharing experience
- **Robots directives** - Granular crawling and indexing control

### Structured Data

Following the **Logos** principle of the Agent Narrative Framework, we implement structured data for enhanced search engine understanding:

| Structured Data Type | Description | Implementation |
|----------------------|-------------|----------------|
| JSON-LD | JavaScript Object Notation for Linked Data | Primary implementation method |
| Schema.org | Vocabulary for structured data | Used for all structured data types |
| Rich Results | Enhanced search listings | Product, FAQ, Article, etc. |

### Technical SEO Elements

Our implementation ensures technical excellence for search engine crawling and indexing:

- **XML Sitemaps** - Comprehensive site structure maps
- **Robots.txt** - Crawler directives and sitemap references
- **Performance optimization** - Core Web Vitals compliance
- **Mobile responsiveness** - Mobile-first indexing support
- **Semantic HTML** - Proper document structure and hierarchy
- **Internal linking** - Strategic content relationships

### Advanced SEO Features

Our implementation utilizes advanced SEO capabilities:

- **Dynamic rendering** - Server-side rendering for search engines
- **Internationalization** - Proper hreflang implementation
- **Image optimization** - Alt text, responsive images, and WebP format
- **Video SEO** - Structured data for video content
- **Local SEO** - Location-based structured data
- **E-commerce SEO** - Product structured data and reviews

## Implementation in Next.js

### Metadata Implementation

Following the **Operational Directives** for code implementation standards:

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Site Name | Primary Keyword',
    template: '%s | Site Name',
  },
  description: 'A compelling description between 150-160 characters that includes primary keywords and encourages clicks from search results.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    siteName: 'Site Name',
    title: 'Site Name | Primary Keyword for Social',
    description: 'A compelling description optimized for social sharing that includes primary keywords.',
    images: [
      {
        url: 'https://example.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Site Name - Primary Keyword',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site Name | Primary Keyword for Twitter',
    description: 'A compelling description optimized for Twitter sharing that includes primary keywords.',
    images: ['https://example.com/images/twitter-image.jpg'],
    creator: '@twitterhandle',
  },
  alternates: {
    canonical: 'https://example.com',
    languages: {
      'en-US': 'https://example.com',
      'es-ES': 'https://example.com/es',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Dynamic Metadata for Pages

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { getBlogPost } from '@/lib/blog';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} and learn about ${post.primaryKeyword}.`,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${post.slug}`,
      images: [
        {
          url: post.featuredImage || 'https://example.com/images/default-blog.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [`https://example.com/authors/${post.author.slug}`],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage || 'https://example.com/images/default-blog.jpg'],
    },
    alternates: {
      canonical: `https://example.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return <div>Post not found</div>;
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Structured Data Implementation

Following the **Pathos** principle of the Agent Narrative Framework, we implement structured data for rich search results:

```typescript
// components/structured-data/ProductSchema.tsx
import { Product } from '@/types/product';

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://example.com${img.url}`),
    sku: product.sku,
    mpn: product.mpn,
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://example.com/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: product.priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviews.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviews.length,
        }
      : undefined,
    review: product.reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
      },
      reviewBody: review.content,
      datePublished: review.date,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### XML Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts, getAllProducts, getAllCategories } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://example.com';
  
  // Get data from CMS or database
  const posts = await getAllPosts();
  const products = await getAllProducts();
  const categories = await getAllCategories();
  
  // Create sitemap entries for blog posts
  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Create sitemap entries for products
  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));
  
  // Create sitemap entries for categories
  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Create sitemap entries for static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];
  
  return [...staticPages, ...postEntries, ...productEntries, ...categoryEntries];
}
```

### Robots.txt Implementation

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/private/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

## SEO Best Practices

Following the **Ethos** principle of the Agent Narrative Framework, we implement these SEO best practices:

### Content Optimization

- **Keyword research** - Identify target keywords for each page
- **Content structure** - Use proper heading hierarchy (H1-H6)
- **Content quality** - Create comprehensive, valuable content
- **Internal linking** - Link related content with descriptive anchor text
- **External linking** - Link to authoritative sources when relevant
- **Content freshness** - Regularly update important content

### Technical Optimization

- **Page speed** - Optimize Core Web Vitals (LCP, FID, CLS)
- **Mobile-first** - Ensure responsive design for all devices
- **URL structure** - Use descriptive, keyword-rich URLs
- **HTTPS** - Secure all pages with SSL certificates
- **Breadcrumbs** - Implement with structured data
- **Pagination** - Use proper rel="next" and rel="prev" tags

### Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
```

## Performance Optimization for SEO

- **Server-side rendering** - Use SSR for dynamic content
- **Static site generation** - Use SSG for static content
- **Incremental Static Regeneration** - Update static pages incrementally
- **Code splitting** - Reduce initial JavaScript payload
- **Font optimization** - Use `next/font` for optimized font loading
- **Image optimization** - Use `next/image` for optimized images
- **Lazy loading** - Defer non-critical resources

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Monitoring and Analytics

- **Google Search Console** - Track search performance and issues
- **Google Analytics** - Monitor user behavior and conversions
- **Core Web Vitals** - Track performance metrics
- **Rank tracking** - Monitor keyword positions
- **Log analysis** - Analyze search engine crawling patterns
- **Heatmaps** - Understand user engagement with content

## Testing Strategy

```typescript
// __tests__/seo/metadata.test.tsx
import { render } from '@testing-library/react';
import { Metadata } from 'next';
import BlogPost, { generateMetadata } from '@/app/blog/[slug]/page';
import { getBlogPost } from '@/lib/blog';

// Mock the data fetching function
jest.mock('@/lib/blog', () => ({
  getBlogPost: jest.fn(),
}));

describe('Blog Post SEO', () => {
  const mockPost = {
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'This is a test post excerpt for SEO testing.',
    content: '<p>Test content</p>',
    publishedAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    author: { name: 'Test Author', slug: 'test-author' },
    featuredImage: '/images/test-image.jpg',
    tags: ['test', 'seo'],
    primaryKeyword: 'test post',
  };

  beforeEach(() => {
    (getBlogPost as jest.Mock).mockResolvedValue(mockPost);
  });

  it('generates correct metadata for blog posts', async () => {
    const metadata = await generateMetadata({ params: { slug: 'test-post' } });
    
    expect(metadata.title).toBe(mockPost.title);
    expect(metadata.description).toBe(mockPost.excerpt);
    expect(metadata.openGraph?.title).toBe(mockPost.title);
    expect(metadata.openGraph?.type).toBe('article');
    expect(metadata.openGraph?.images?.[0].url).toBe(mockPost.featuredImage);
    expect(metadata.alternates?.canonical).toBe(`https://example.com/blog/${mockPost.slug}`);
  });

  it('handles missing blog posts gracefully', async () => {
    (getBlogPost as jest.Mock).mockResolvedValue(null);
    
    const metadata = await generateMetadata({ params: { slug: 'missing-post' } });
    
    expect(metadata.title).toBe('Post Not Found');
    expect(metadata.description).toBe('The requested blog post could not be found.');
  });
});
```
