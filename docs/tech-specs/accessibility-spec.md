# Accessibility Technical Specification

## Overview

This document provides a technical overview of our accessibility implementation, following the **Agent Narrative Framework** principles. Our accessibility strategy ensures that our applications are usable by people with a wide range of abilities, adhering to WCAG 2.1 AA standards and leveraging the complementary relationship between semantic HTML and ARIA attributes.

## Core Components

### Semantic HTML

Semantic HTML forms the foundation of our accessibility implementation, providing inherent meaning and structure to content:

| Element | Purpose | Usage |
|---------|---------|-------|
| `<header>` | Identifies the top of a page, article, section, or component | Site headers, section headers |
| `<nav>` | Identifies a navigation region | Main navigation, pagination, breadcrumbs |
| `<main>` | Identifies the main content area | Primary content of the page |
| `<section>` | Identifies a thematic grouping of content | Distinct sections of content |
| `<article>` | Identifies a self-contained composition | Blog posts, news items, comments |
| `<aside>` | Identifies content tangentially related to the main content | Sidebars, pull quotes, notes |
| `<footer>` | Identifies the bottom of a page, article, section, or component | Site footers, section footers |
| `<figure>` & `<figcaption>` | Identifies self-contained media with optional caption | Images, diagrams, code snippets with captions |
| `<time>` | Identifies date/time information | Publication dates, event times |
| `<mark>` | Identifies highlighted text | Search results highlighting |
| `<details>` & `<summary>` | Identifies expandable/collapsible content | FAQs, accordions |

### ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes supplement HTML semantics for complex interactive components:

#### Key ARIA Attributes

| Attribute | Purpose | Example Usage |
|-----------|---------|---------------|
| `aria-label` | Provides an accessible name when visible text is not available | `<button aria-label="Close dialog">×</button>` |
| `aria-labelledby` | References visible text element(s) that label the component | `<div role="dialog" aria-labelledby="dialog-title">...</div>` |
| `aria-describedby` | References text that provides additional description | `<input aria-describedby="password-requirements">` |
| `aria-expanded` | Indicates if a collapsible element is expanded | `<button aria-expanded="false">Show more</button>` |
| `aria-hidden` | Hides content from assistive technologies | `<div aria-hidden="true">Decorative content</div>` |
| `aria-current` | Indicates the current item in a set | `<a aria-current="page">Current page</a>` |
| `aria-live` | Defines an area that will be updated dynamically | `<div aria-live="polite">Status messages</div>` |
| `aria-atomic` | Indicates whether the entire region should be announced on changes | `<div aria-live="polite" aria-atomic="true">...</div>` |
| `aria-busy` | Indicates an element is being updated | `<div aria-busy="true">Loading...</div>` |

#### ARIA Roles

| Role | Purpose | Example Usage |
|------|---------|---------------|
| `role="alert"` | Identifies time-sensitive messages | `<div role="alert">Form submission failed</div>` |
| `role="dialog"` | Identifies a dialog or modal window | `<div role="dialog" aria-modal="true">...</div>` |
| `role="tablist"`, `role="tab"`, `role="tabpanel"` | Identifies tab interface components | Tab navigation systems |
| `role="menu"`, `role="menuitem"` | Identifies menu components | Dropdown menus |
| `role="button"` | Identifies an element functioning as a button | `<div role="button" tabindex="0">Click me</div>` |
| `role="status"` | Identifies status messages | `<div role="status">3 items in cart</div>` |
| `role="progressbar"` | Identifies progress indicators | `<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">...</div>` |

## HTML Semantics vs. ARIA: Best Practices

Following the **Logos** principle of the Agent Narrative Framework, we implement these best practices:

1. **Native HTML elements first**: Always prefer native HTML elements with built-in semantics over generic elements with ARIA roles.
   ```html
   <!-- Preferred -->
   <button type="button">Submit</button>
   
   <!-- Avoid -->
   <div role="button" tabindex="0">Submit</div>
   ```

2. **No redundant ARIA**: Don't use ARIA to duplicate semantics already provided by HTML elements.
   ```html
   <!-- Incorrect - redundant -->
   <button role="button">Submit</button>
   
   <!-- Correct -->
   <button>Submit</button>
   ```

3. **Enhance, don't override**: Use ARIA to enhance semantics, not override them.
   ```html
   <!-- Correct enhancement -->
   <button aria-pressed="false">Toggle feature</button>
   ```

4. **Maintain accessibility tree integrity**: Ensure ARIA attributes accurately reflect the state and properties of components.
   ```html
   <!-- Ensure expanded state is updated via JavaScript -->
   <button aria-expanded="false" aria-controls="dropdown-menu">Menu</button>
   <ul id="dropdown-menu" hidden>...</ul>
   ```

5. **Minimize ARIA usage**: Use ARIA sparingly and only when necessary.

## Implementation in Next.js

### Accessible Navigation Component

```tsx
// components/Navigation.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  items: NavItem[];
}

export default function Navigation({ items }: NavigationProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav aria-label="Main navigation">
      <button 
        className="md:hidden"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
      >
        <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
        {/* SVG icon would go here */}
      </button>
      
      <ul 
        id="main-menu"
        className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}
      >
        {items.map((item) => {
          const isCurrentPage = router.pathname === item.href;
          return (
            <li key={item.href}>
              <Link 
                href={item.href}
                aria-current={isCurrentPage ? 'page' : undefined}
                className={isCurrentPage ? 'font-bold' : ''}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

### Accessible Modal Dialog

```tsx
// components/Modal.tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from 'focus-trap-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Prevent scrolling on the body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <FocusTrap>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="dialog-title" className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
```

### Accessible Form Component

```tsx
// components/Form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      aria-describedby="form-status"
      noValidate
    >
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">
          Name <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="name"
          type="text"
          className="w-full p-2 border rounded"
          {...register('name', { required: 'Name is required' })}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-red-500 mt-1" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">
          Email <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-2 border rounded"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-red-500 mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="message" className="block mb-1">
          Message <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <textarea
          id="message"
          className="w-full p-2 border rounded"
          rows={4}
          {...register('message', { required: 'Message is required' })}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        ></textarea>
        {errors.message && (
          <p id="message-error" className="text-red-500 mt-1" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>
      
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      {submitStatus && (
        <div 
          id="form-status" 
          className={`mt-4 p-3 rounded ${submitStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}
          role={submitStatus === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {submitStatus === 'success' 
            ? 'Your message has been sent successfully!' 
            : 'There was an error submitting the form. Please try again.'}
        </div>
      )}
    </form>
  );
}
```

### Accessible Tabs Component

```tsx
// components/Tabs.tsx
import { useState, useId } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
}

export default function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0].id);
  const baseId = useId();
  
  return (
    <div>
      <div 
        role="tablist" 
        aria-label="Content tabs"
        className="flex border-b"
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          
          return (
            <button
              key={tab.id}
              id={tabId}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              className={`py-2 px-4 ${isActive ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const tabId = `${baseId}-tab-${tab.id}`;
        const panelId = `${baseId}-panel-${tab.id}`;
        
        return (
          <div
            key={tab.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={0}
            hidden={!isActive}
            className="p-4"
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
```

## Keyboard Navigation

Following the **Pathos** principle of the Agent Narrative Framework, we ensure keyboard navigability:

### Focus Management

- **Focus indicators**: Visible focus styles for all interactive elements
- **Focus trapping**: Contain focus within modals and dialogs
- **Focus restoration**: Return focus to trigger elements when dialogs close
- **Skip links**: Allow keyboard users to bypass repetitive navigation

```tsx
// components/SkipLink.tsx
import { useState } from 'react';

export default function SkipLink() {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <a
      href="#main-content"
      className={`
        fixed top-0 left-0 p-3 bg-blue-600 text-white z-50 transform -translate-y-full
        ${isFocused ? 'translate-y-0' : ''}
        focus:translate-y-0 transition-transform
      `}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to main content
    </a>
  );
}
```

### Keyboard Shortcuts

```tsx
// hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutOptions {
  alt?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: KeyHandler,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.altKey === !!options.alt &&
        event.ctrlKey === !!options.ctrl &&
        event.shiftKey === !!options.shift &&
        event.metaKey === !!options.meta
      ) {
        callback(event);
      }
    };
    
    window.addEventListener('keydown', handler);
    
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback, options]);
}
```

## Color and Contrast

Following the **Ethos** principle of the Agent Narrative Framework, we ensure proper color contrast:

- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **Color independence**: Information is not conveyed by color alone
- **Focus indicators**: High-contrast focus styles
- **Dark mode support**: Maintain contrast in all color schemes

```tsx
// components/Alert.tsx
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    success: 'bg-green-100 border-green-500 text-green-900',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    error: 'bg-red-100 border-red-500 text-red-900',
    info: 'bg-blue-100 border-blue-500 text-blue-900',
  };
  
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };
  
  return (
    <div 
      className={`p-4 border-l-4 ${styles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-center">
        <span className="mr-2" aria-hidden="true">{icons[type]}</span>
        <span>
          <span className="sr-only">{type}: </span>
          {message}
        </span>
      </div>
    </div>
  );
}
```

## Screen Reader Support

- **Descriptive alt text**: Meaningful descriptions for images
- **ARIA live regions**: Announce dynamic content changes
- **Status messages**: Use `role="status"` or `role="alert"` appropriately
- **Hidden content**: Use `aria-hidden="true"` for decorative elements
- **Screen reader text**: Use `.sr-only` class for visually hidden text

```tsx
// components/ScreenReaderText.tsx
interface ScreenReaderTextProps {
  children: React.ReactNode;
}

export default function ScreenReaderText({ children }: ScreenReaderTextProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
```

## Testing Strategy

### Automated Testing

```tsx
// __tests__/accessibility/navigation.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navigation from '@/components/Navigation';

expect.extend(toHaveNoViolations);

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
  }),
}));

describe('Navigation Component', () => {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  
  it('should have no accessibility violations', async () => {
    const { container } = render(<Navigation items={navItems} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should mark the current page with aria-current', () => {
    render(<Navigation items={navItems} />);
    const currentPageLink = screen.getByText('Home');
    expect(currentPageLink).toHaveAttribute('aria-current', 'page');
  });
  
  it('should toggle menu visibility when button is clicked', async () => {
    render(<Navigation items={navItems} />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    
    // Menu should be hidden initially
    expect(screen.getByRole('list')).toHaveClass('hidden');
    
    // Click to open menu
    await userEvent.click(menuButton);
    expect(screen.getByRole('list')).toHaveClass('block');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click to close menu
    await userEvent.click(menuButton);
    expect(screen.getByRole('list')).toHaveClass('hidden');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
```

### Manual Testing Checklist

- **Keyboard navigation**: Test all interactive elements with keyboard only
- **Screen reader testing**: Test with NVDA, JAWS, and VoiceOver
- **Zoom testing**: Test at 200% zoom
- **Color contrast**: Verify with contrast checker tools
- **Reduced motion**: Test with prefers-reduced-motion enabled
- **High contrast mode**: Test with high contrast mode enabled

## Accessibility Best Practices

### Document Structure

- Use a single `<h1>` per page
- Maintain proper heading hierarchy (H1 → H2 → H3)
- Use landmarks (`<header>`, `<main>`, `<nav>`, etc.) appropriately
- Ensure proper reading order in the DOM

### Interactive Elements

- Ensure all interactive elements are keyboard accessible
- Use appropriate roles for custom controls
- Maintain focus management for dynamic content
- Provide feedback for user actions

### Content

- Use clear, simple language
- Provide text alternatives for non-text content
- Ensure sufficient color contrast
- Avoid content that flashes or flickers

### Forms

- Associate labels with form controls
- Group related form controls with `<fieldset>` and `<legend>`
- Provide clear error messages
- Use appropriate input types

## References

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs: ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [The A11Y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [HTML5 Accessibility](https://www.html5accessibility.com/)
- [Next.js Accessibility](https://nextjs.org/docs/advanced-features/accessibility) 