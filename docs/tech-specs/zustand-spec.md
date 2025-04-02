# Zustand Technical Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Core Concepts: Line ~40
- Basic Store Implementation: Line ~60
- Advanced Usage: Line ~100
  - Middleware: Line ~110
  - Slices Pattern: Line ~150
  - Async Actions: Line ~190
- Integration with React: Line ~230
  - Component Usage: Line ~240
  - Custom Hooks: Line ~280
- TypeScript Integration: Line ~320
- Performance Optimization: Line ~370
- Testing: Line ~410
- Best Practices: Line ~450

## References

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand)
- [Zustand Recipes](https://github.com/pmndrs/zustand/blob/main/docs/recipes)
- [Zustand Middleware](https://github.com/pmndrs/zustand/blob/main/docs/middleware.md)
- [Zustand TypeScript Guide](https://github.com/pmndrs/zustand/blob/main/docs/typescript.md)
- [React State Management Comparison](https://react.dev/learn/managing-state)
- [Redux to Zustand Migration](https://docs.pmnd.rs/zustand/getting-started/comparison#redux)

## Overview

This document provides a technical overview of Zustand implementation within our application. Zustand is a small, fast, and scalable state-management solution for React applications. It leverages hooks to provide a simpler and more intuitive API compared to traditional state management libraries.

## Version and Resources

- **Version**: Zustand 4.x
- **Documentation**: [Zustand Documentation](https://docs.pmnd.rs/zustand)
- **GitHub Repository**: [Zustand GitHub](https://github.com/pmndrs/zustand)

## Core Features

- **Simple API**: Minimal and intuitive API with hooks
- **Unopinionated**: Works with any UI framework (React-focused)
- **Lightweight**: Tiny bundle size (less than 1KB)
- **Performant**: Optimized rendering with built-in memoization
- **Flexible**: Compatible with middleware, devtools, and other extensions
- **TypeScript Support**: First-class TypeScript support
- **Persistence**: Optional localStorage/sessionStorage persistence
- **Immer Integration**: Optional integration with Immer for immutable state updates

## Implementation

### Installation

```bash
npm install zustand
# or
yarn add zustand
```

### Basic Store Creation

```typescript
import { create } from 'zustand';

// Define the store interface
interface BearStore {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

// Create a store
const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
```

### Using the Store in Components

```tsx
import React from 'react';
import { useBearStore } from './stores/bearStore';

function BearCounter() {
  // Extract only what you need from the store
  const bearCount = useBearStore((state) => state.bears);
  
  return <h1>{bearCount} bears around here...</h1>;
}

function Controls() {
  const { increasePopulation, removeAllBears } = useBearStore((state) => ({
    increasePopulation: state.increasePopulation,
    removeAllBears: state.removeAllBears,
  }));
  
  return (
    <div>
      <button onClick={increasePopulation}>Add Bear</button>
      <button onClick={removeAllBears}>Remove All</button>
    </div>
  );
}

function App() {
  return (
    <>
      <BearCounter />
      <Controls />
    </>
  );
}
```

### TypeScript Integration

```typescript
interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (userData: Partial<UserState['user']>) => Promise<void>;
  logout: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const userData = await response.json();
      set({ user: userData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const updatedUser = await response.json();
      set((state) => ({
        user: { ...state.user, ...updatedUser },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  logout: () => {
    set({ user: null });
  },
}));
```

## Advanced Patterns

### Middleware

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Compose multiple middleware functions
const useCounterStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      {
        name: 'counter-storage', // unique name for localStorage key
      }
    )
  )
);
```

### Integration with Immer

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoState {
  todos: Array<{
    id: number;
    text: string;
    completed: boolean;
  }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
}

const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    
    addTodo: (text) => set((state) => {
      state.todos.push({
        id: Date.now(),
        text,
        completed: false,
      });
    }),
    
    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find((todo) => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }),
    
    removeTodo: (id) => set((state) => {
      state.todos = state.todos.filter((todo) => todo.id !== id);
    }),
  }))
);
```

### Combining Multiple Stores

```typescript
// userStore.ts
import { create } from 'zustand';

interface UserState {
  user: { id: string; name: string } | null;
  setUser: (user: UserState['user']) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// notificationStore.ts
import { create } from 'zustand';

interface NotificationState {
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message) => 
    set((state) => ({ 
      notifications: [...state.notifications, message] 
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

// Usage
function AppHeader() {
  const user = useUserStore((state) => state.user);
  const notificationCount = useNotificationStore(
    (state) => state.notifications.length
  );
  
  return (
    <header>
      {user ? `Welcome, ${user.name}` : 'Please login'}
      <div>Notifications: {notificationCount}</div>
    </header>
  );
}
```

### Slices Pattern for Large Stores

```typescript
import { create, StateCreator } from 'zustand';

// Define slices
interface UserSlice {
  user: { id: string; name: string } | null;
  setUser: (user: UserSlice['user']) => void;
  logout: () => void;
}

interface SettingsSlice {
  darkMode: boolean;
  language: string;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
}

// Create slice implementations
const createUserSlice: StateCreator<
  UserSlice & SettingsSlice,
  [],
  [],
  UserSlice
> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createSettingsSlice: StateCreator<
  UserSlice & SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  darkMode: false,
  language: 'en',
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setLanguage: (language) => set({ language }),
});

// Combine slices into a single store
const useStore = create<UserSlice & SettingsSlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createSettingsSlice(...a),
}));

// Usage
function Profile() {
  const { user, darkMode, toggleDarkMode } = useStore();
  
  return (
    <div className={darkMode ? 'dark' : 'light'}>
      {user ? <h1>{user.name}'s Profile</h1> : <h1>Please login</h1>}
      <button onClick={toggleDarkMode}>
        Switch to {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

## Integration with React Frameworks

### Next.js Integration

```typescript
// stores/themeStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: ThemeStore['theme']) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      // Handle Next.js SSR
      storage: createJSONStorage(() => {
        // Check if window is defined (browser) or not (server)
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        };
      }),
    }
  )
);

// Using in a component
'use client'; // For Next.js App Router

import { useThemeStore } from '@/stores/themeStore';

export default function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();
  
  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value as ThemeStore['theme'])}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

### Server Components and Hydration

```typescript
// For Next.js App Router with server components
// app/providers.tsx
'use client';

import { ReactNode, useRef } from 'react';
import { useStore } from 'zustand';
import { useUserStore } from '@/stores/userStore';

interface StoreProviderProps {
  children: ReactNode;
  initialState?: Partial<ReturnType<typeof useUserStore.getState>>;
}

// This component helps with hydration
export function StoreProvider({
  children,
  initialState = {},
}: StoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof useUserStore>>();
  
  if (!storeRef.current) {
    // Create a new store if one doesn't exist
    storeRef.current = useUserStore;
    
    // If initialState is provided, update the store
    if (Object.keys(initialState).length > 0) {
      storeRef.current.setState({
        ...storeRef.current.getState(),
        ...initialState,
      });
    }
  }
  
  return <>{children}</>;
}

// app/layout.tsx
import { StoreProvider } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Can fetch initial state here in a Server Component
  const initialState = {
    // Initial data from server
  };
  
  return (
    <html lang="en">
      <body>
        <StoreProvider initialState={initialState}>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

## Best Practices

### Store Organization

```typescript
// stores/userStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

// Separate state and actions
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    (set) => ({
      // State
      user: null,
      isLoading: false,
      error: null,
      
      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          if (!response.ok) {
            throw new Error('Login failed');
          }
          
          const user = await response.json();
          set({ user, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      fetchUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/users/${id}`);
          if (!response.ok) throw new Error('Failed to fetch user');
          const user = await response.json();
          set({ user, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      updateUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/users/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) throw new Error('Failed to update user');
          
          const updatedUser = await response.json();
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      logout: () => set({ user: null, error: null }),
    }),
    { name: 'user-store' }
  )
);

// Custom selectors for optimized re-renders
export const useUser = () => useUserStore((state) => state.user);
export const useUserError = () => useUserStore((state) => state.error);
export const useUserLoading = () => useUserStore((state) => state.isLoading);
export const useUserActions = () => useUserStore(
  (state) => ({
    login: state.login,
    fetchUser: state.fetchUser,
    updateUser: state.updateUser,
    logout: state.logout,
  }),
  shallow
);
```

### Selector Optimization

```typescript
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface TodoState {
  todos: { id: number; text: string; completed: boolean }[];
  activeTodoCount: number; // Derived state
  filter: 'all' | 'active' | 'completed';
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  setFilter: (filter: TodoState['filter']) => void;
}

const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  filter: 'all',
  
  // Derived state calculated on access
  get activeTodoCount() {
    return get().todos.filter(todo => !todo.completed).length;
  },
  
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, completed: false }],
  })),
  
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ),
  })),
  
  setFilter: (filter) => set({ filter }),
}));

// Optimized selectors
export const useTodoList = () => {
  const { todos, filter } = useTodoStore(
    (state) => ({
      todos: state.todos,
      filter: state.filter,
    }),
    shallow
  );
  
  return todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
};

export const useActiveTodoCount = () => useTodoStore(state => state.activeTodoCount);

export const useTodoFilter = () => useTodoStore(state => state.filter);

export const useTodoActions = () => useTodoStore(state => ({
  addTodo: state.addTodo,
  toggleTodo: state.toggleTodo,
  setFilter: state.setFilter,
}), shallow);
```

## Testing

### Unit Testing Stores

```typescript
// counterStore.test.ts
import { create } from 'zustand';
import { act } from 'react-dom/test-utils';

// Create a test version of the store
const createTestStore = () => {
  return create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }));
};

describe('Counter Store', () => {
  it('should initialize with count 0', () => {
    const useStore = createTestStore();
    expect(useStore.getState().count).toBe(0);
  });
  
  it('should increment count', () => {
    const useStore = createTestStore();
    
    act(() => {
      useStore.getState().increment();
    });
    
    expect(useStore.getState().count).toBe(1);
  });
  
  it('should decrement count', () => {
    const useStore = createTestStore();
    
    act(() => {
      useStore.getState().increment();
      useStore.getState().increment();
      useStore.getState().decrement();
    });
    
    expect(useStore.getState().count).toBe(1);
  });
});
```

### Testing Components with Stores

```tsx
// Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { create } from 'zustand';

// Mock the store
jest.mock('../stores/counterStore', () => ({
  useCounterStore: create((set) => ({
    count: 0,
    increment: jest.fn().mockImplementation(() => 
      set((state) => ({ count: state.count + 1 }))),
    decrement: jest.fn().mockImplementation(() => 
      set((state) => ({ count: state.count - 1 }))),
  })),
}));

import Counter from './Counter';
import { useCounterStore } from '../stores/counterStore';

describe('Counter Component', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCounterStore.setState({ count: 0 });
  });
  
  it('renders the counter with initial value', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
  
  it('increments counter when increment button is clicked', () => {
    render(<Counter />);
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
  
  it('decrements counter when decrement button is clicked', () => {
    useCounterStore.setState({ count: 5 });
    render(<Counter />);
    fireEvent.click(screen.getByText('Decrement'));
    expect(screen.getByText('Count: 4')).toBeInTheDocument();
  });
});
```

## Performance Optimizations

### Avoiding Unnecessary Re-renders

```tsx
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import React from 'react';

interface ProfileState {
  user: {
    id: string;
    name: string;
    email: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  } | null;
  updatePreferences: (prefs: Partial<ProfileState['user']['preferences']>) => void;
}

const useProfileStore = create<ProfileState>((set) => ({
  user: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  },
  updatePreferences: (prefs) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            preferences: {
              ...state.user.preferences,
              ...prefs,
            },
          }
        : null,
    })),
}));

// BAD: Will re-render even when unrelated state changes
function BadProfileHeader() {
  // This component will re-render whenever ANY part of the user object changes
  const user = useProfileStore((state) => state.user);
  
  return <h1>Welcome, {user?.name}</h1>;
}

// GOOD: Only re-renders when name changes
function GoodProfileHeader() {
  // Only extract what you need
  const userName = useProfileStore((state) => state.user?.name);
  
  return <h1>Welcome, {userName}</h1>;
}

// GOOD: Using shallow comparison for objects
function ThemeSelector() {
  // Use shallow to compare objects by their properties
  const { theme, updatePreferences } = useProfileStore(
    (state) => ({
      theme: state.user?.preferences.theme,
      updatePreferences: state.updatePreferences,
    }),
    shallow
  );
  
  return (
    <select
      value={theme}
      onChange={(e) =>
        updatePreferences({ theme: e.target.value as 'light' | 'dark' })
      }
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}

// BEST: Using memoized components for complex objects
const NotificationSettings = React.memo(function NotificationSettings() {
  const notifications = useProfileStore(
    (state) => state.user?.preferences.notifications
  );
  const updatePreferences = useProfileStore((state) => state.updatePreferences);
  
  return (
    <label>
      <input
        type="checkbox"
        checked={notifications}
        onChange={(e) => updatePreferences({ notifications: e.target.checked })}
      />
      Enable notifications
    </label>
  );
});
```

## Security Considerations

- **Sensitive Data**: Avoid storing sensitive data like auth tokens in persistent stores
- **Data Sanitization**: Always sanitize user input before storing it
- **Storage Encryption**: Consider encrypting data when using persistence middleware
- **Local Storage Risks**: Be aware of XSS vulnerabilities when using localStorage
