# React Implementation Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Version and Dependencies: Line ~40
- Core Concepts: Line ~50
  - Component Architecture: Line ~60
  - React Server Components: Line ~90
  - Client Components: Line ~130
- State Management: Line ~150
  - React Hooks: Line ~160
  - React 19 Hooks: Line ~210
  - Global State Management: Line ~250
- Component Patterns: Line ~280
  - Composition: Line ~290
  - Render Props: Line ~320
  - Higher-Order Components: Line ~350
  - Custom Hooks: Line ~380
- Performance Optimization: Line ~430
  - Memoization: Line ~440
  - Code Splitting: Line ~470
  - Virtualization: Line ~500
  - Suspense and Streaming: Line ~540
- Accessibility: Line ~570
- Testing: Line ~660

## References

- [React Documentation](https://react.dev/reference/react)
- [React GitHub Repository](https://github.com/facebook/react)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [React Hooks API Reference](https://react.dev/reference/react/hooks)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [React Accessibility](https://react.dev/reference/react-dom/components#accessibility-attributes)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Overview

This document provides a technical overview of React, a JavaScript library for building user interfaces. React enables developers to create interactive UIs using a component-based architecture, making it easier to develop and maintain complex applications.

## Version and Dependencies

- **React Version**: 19.x
- **Key Dependencies**:
  - `react-dom` - For DOM rendering
  - `react-server-dom` - For server components (Next.js App Router)
  - `@types/react` - TypeScript type definitions

## Core Concepts

### Component Architecture

React applications are built using components, which are reusable, self-contained pieces of UI. Components can be:

- **Functional Components** (Preferred):
  ```jsx
  const Button = ({ onClick, children }) => {
    return (
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={onClick}
      >
        {children}
      </button>
    );
  };
  ```

- **Class Components** (Legacy):
  ```jsx
  class Button extends React.Component {
    render() {
      return (
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={this.props.onClick}
        >
          {this.props.children}
        </button>
      );
    }
  }
  ```

### React Server Components (RSC)

React 19 and Next.js App Router introduce Server Components, which run exclusively on the server:

- **Benefits**:
  - Zero JavaScript bundle impact
  - Direct access to backend resources
  - Improved performance for static content
  - Automatic code splitting

- **Implementation**:
  ```jsx
  // app/page.jsx - Server Component
  import { db } from '@/lib/db';
  
  export default async function Page() {
    // This runs on the server only
    const data = await db.query('SELECT * FROM posts');
    
    return (
      <div>
        <h1>Blog Posts</h1>
        <ul>
          {data.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>
    );
  }
  ```

### Client Components

Components that need interactivity or browser APIs should be client components:

```jsx
'use client'; // This directive marks a Client Component

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## State Management

### React Hooks

Hooks are functions that let you "hook into" React state and lifecycle features from functional components:

- **useState** - For local component state:
  ```jsx
  const [state, setState] = useState(initialState);
  ```

- **useEffect** - For side effects:
  ```jsx
  useEffect(() => {
    // Run on mount and when dependencies change
    document.title = `Count: ${count}`;
    
    return () => {
      // Cleanup function (runs before effect re-runs or on unmount)
      document.title = 'React App';
    };
  }, [count]); // Dependencies array
  ```

- **useContext** - For consuming context:
  ```jsx
  const value = useContext(MyContext);
  ```

- **useReducer** - For complex state logic:
  ```jsx
  const [state, dispatch] = useReducer(reducer, initialState);
  ```

- **useCallback** - For memoizing functions:
  ```jsx
  const memoizedCallback = useCallback(() => {
    doSomething(a, b);
  }, [a, b]);
  ```

- **useMemo** - For memoizing values:
  ```jsx
  const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  ```

- **useRef** - For persistent mutable values:
  ```jsx
  const inputRef = useRef(null);
  // Later: inputRef.current.focus();
  ```

### React 19 Hooks

React 19 introduces new hooks for improved performance and developer experience:

- **use** - For consuming promises and context:
  ```jsx
  const data = use(promise); // Suspense-enabled data fetching
  ```

- **useOptimistic** - For optimistic UI updates:
  ```jsx
  const [optimisticState, addOptimistic] = useOptimistic(
    state,
    (currentState, optimisticValue) => {
      // Return the new optimistic state
      return { ...currentState, ...optimisticValue };
    }
  );
  ```

- **useFormStatus** - For form submission state:
  ```jsx
  const { pending, data, method, action } = useFormStatus();
  ```

- **useFormState** - For form state management:
  ```jsx
  const [state, formAction] = useFormState(serverAction, initialState);
  ```

### Global State Management

For larger applications, consider these state management solutions:

- **Context API** - Built-in solution for passing data through the component tree:
  ```jsx
  // Create context
  const ThemeContext = createContext('light');
  
  // Provider
  function App() {
    return (
      <ThemeContext.Provider value="dark">
        <ThemedButton />
      </ThemeContext.Provider>
    );
  }
  
  // Consumer
  function ThemedButton() {
    const theme = useContext(ThemeContext);
    return <button className={theme}>Themed Button</button>;
  }
  ```

- **Zustand** - Lightweight state management:
  ```jsx
  import { create } from 'zustand';
  
  const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }));
  
  function Counter() {
    const { count, increment } = useStore();
    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  }
  ```

- **Redux Toolkit** - For complex state requirements:
  ```jsx
  import { createSlice, configureStore } from '@reduxjs/toolkit';
  
  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
      increment: (state) => {
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
    },
  });
  
  const store = configureStore({
    reducer: {
      counter: counterSlice.reducer,
    },
  });
  ```

## Component Patterns

### Composition

Favor composition over inheritance for component reuse:

```jsx
function Card({ title, children }) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ProfileCard({ user }) {
  return (
    <Card title={user.name}>
      <p>{user.bio}</p>
      <button className="mt-2">Follow</button>
    </Card>
  );
}
```

### Render Props

Pass rendering logic as props:

```jsx
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);
  
  return render({ data, loading });
}

// Usage
<DataFetcher 
  url="/api/users" 
  render={({ data, loading }) => (
    loading ? <p>Loading...</p> : <UserList users={data} />
  )}
/>
```

### Higher-Order Components (HOCs)

Functions that take a component and return a new enhanced component:

```jsx
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const isAuthenticated = useAuth();
    
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

### Custom Hooks

Extract reusable stateful logic into custom hooks:

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  
  return (
    <div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
    </div>
  );
}
```

## Performance Optimization

### Memoization

Use React.memo to prevent unnecessary re-renders:

```jsx
const MemoizedComponent = React.memo(function MyComponent(props) {
  // Only re-renders if props change
  return <div>{props.name}</div>;
});
```

### Code Splitting

Split your code into smaller chunks to improve load time:

```jsx
import { lazy, Suspense } from 'react';

// Lazy load component
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Virtualization

Render only visible items in long lists:

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div 
      ref={parentRef}
      style={{ height: '400px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Suspense and Streaming

Use Suspense for improved loading states:

```jsx
import { Suspense } from 'react';

function App() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      
      <Suspense fallback={<MainContentSkeleton />}>
        <MainContent />
      </Suspense>
      
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </div>
  );
}
```

## Accessibility

### ARIA Attributes

Ensure proper accessibility with ARIA attributes:

```jsx
function Dropdown({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected || label}
      </button>
      
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="dropdown-label"
          tabIndex={-1}
        >
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              aria-selected={selected === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Keyboard Navigation

Ensure components are keyboard accessible:

```jsx
function TabPanel({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowRight':
        setActiveTab(prev => (prev + 1) % tabs.length);
        break;
      case 'ArrowLeft':
        setActiveTab(prev => (prev - 1 + tabs.length) % tabs.length);
        break;
      default:
        break;
    }
  };
  
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={e => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div role="tabpanel">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
```

### Focus Management

Manage focus for improved user experience:

```jsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save previous focus
      const previousFocus = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      return () => {
        // Restore focus when modal closes
        previousFocus?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-6 rounded shadow-lg">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

## Testing

### Component Testing

Use React Testing Library for component tests:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments count when button is clicked', () => {
  render(<Counter />);
  
  // Initial state
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
  
  // Click the button
  fireEvent.click(screen.getByText('Increment'));
  
  // Updated state
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Hook Testing

Test custom hooks with React Hooks Testing Library:

```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### Integration Testing

Test component interactions:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

test('shows edit form when edit button is clicked', async () => {
  render(<UserProfile user={{ id: 1, name: 'John Doe' }} />);
  
  // Initial state
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  
  // Click edit button
  fireEvent.click(screen.getByText('Edit Profile'));
  
  // Form should be visible
  expect(screen.getByRole('form')).toBeInTheDocument();
  expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
});
```

## Best Practices

### File Structure

Organize components by feature or type:

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Input.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   └── features/
│       ├── auth/
│       │   ├── LoginForm.jsx
│       │   └── SignupForm.jsx
│       └── dashboard/
│           ├── DashboardStats.jsx
│           └── RecentActivity.jsx
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   ├── api.js
│   └── formatters.js
└── pages/
    ├── Home.jsx
    ├── Dashboard.jsx
    └── Profile.jsx
```

### Naming Conventions

Follow consistent naming patterns:

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Context**: PascalCase with 'Context' suffix (e.g., `AuthContext.jsx`)
- **Utility functions**: camelCase (e.g., `formatDate.js`)

### Error Boundaries

Catch and handle errors gracefully:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```

### Prop Validation

Use TypeScript or PropTypes for prop validation:

```jsx
// TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function Button({ 
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  children
}: ButtonProps) {
  // Component implementation
}

// PropTypes
import PropTypes from 'prop-types';

function Button({ variant, size, onClick, disabled, children }) {
  // Component implementation
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired
};

Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
  disabled: false
};
```

## References

- [React Documentation](https://react.dev/reference/react)
- [React GitHub Repository](https://github.com/facebook/react)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [React Hooks API Reference](https://react.dev/reference/react/hooks)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [React Accessibility](https://react.dev/reference/react-dom/components#accessibility-attributes)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)