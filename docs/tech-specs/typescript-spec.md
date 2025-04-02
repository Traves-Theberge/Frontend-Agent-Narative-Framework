# TypeScript Implementation Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Version and Configuration: Line ~40
- Core Type System: Line ~70
  - Basic Types: Line ~80
  - Interface and Type Aliases: Line ~110
  - Advanced Types: Line ~140
- Type Definitions for Common Patterns: Line ~180
  - API Types: Line ~190
  - React Component Types: Line ~230
  - State Management Types: Line ~270
- Type Safety Best Practices: Line ~310
  - Strict Null Checking: Line ~320
  - Union Types and Type Guards: Line ~340
  - Discriminated Unions: Line ~370
  - Generic Types: Line ~400
  - Utility Types: Line ~440
- TypeScript with React: Line ~480
  - Component Types: Line ~490
  - Hooks with TypeScript: Line ~530
  - Event Handling: Line ~580
- TypeScript 5.8 Features: Line ~620
  - Using Statement for Resource Management: Line ~630
  - Improved Type Inference: Line ~660
  - Decorator Metadata: Line ~690

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript GitHub Repository](https://github.com/microsoft/TypeScript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Release Notes](https://devblogs.microsoft.com/typescript/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Overview

This document provides a technical overview of TypeScript, a strongly typed programming language that builds on JavaScript by adding static type definitions. TypeScript enhances developer productivity through better tooling, error detection, and code organization.

## Version and Configuration

- **TypeScript Version**: 5.8.x
- **Documentation**: [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- **GitHub Repository**: [microsoft/TypeScript](https://github.com/microsoft/TypeScript)

### tsconfig.json

The TypeScript compiler is configured through `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Core Type System

### Basic Types

TypeScript provides several basic types:

```typescript
// Primitive types
const isActive: boolean = true;
const count: number = 42;
const name: string = "TypeScript";
const notFound: undefined = undefined;
const empty: null = null;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];

// Tuples
const pair: [string, number] = ["key", 123];

// Enums
enum Direction {
  Up,
  Down,
  Left,
  Right
}
const move: Direction = Direction.Up;

// Any (avoid when possible)
let flexible: any = 4;
flexible = "can be anything";

// Unknown (safer alternative to any)
let safeFlexible: unknown = 4;
// Need type checking before using
if (typeof safeFlexible === 'number') {
  const sum = safeFlexible + 1;
}

// Void
function logMessage(): void {
  console.log("This function returns nothing");
}

// Never
function throwError(): never {
  throw new Error("This function never returns");
}
```

### Interface and Type Aliases

Interfaces and type aliases define custom types:

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt?: Date; // Optional property
  readonly apiKey: string; // Read-only property
}

// Type alias
type UserRole = 'user' | 'admin' | 'moderator';

// Extending interfaces
interface Employee extends User {
  department: string;
  salary: number;
}

// Intersection types
type AdminUser = User & {
  permissions: string[];
};

// Union types
type ID = string | number;

// Literal types
type Theme = 'light' | 'dark' | 'system';
```

### Advanced Types

TypeScript offers advanced type features:

```typescript
// Generics
function identity<T>(arg: T): T {
  return arg;
}
const num = identity<number>(42);
const str = identity("hello");

// Utility types
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// Partial - all properties optional
const partialTodo: Partial<Todo> = { title: "Learn TypeScript" };

// Required - all properties required
const requiredTodo: Required<Todo> = {
  title: "Learn TypeScript",
  description: "Study advanced types",
  completed: false
};

// Pick - select specific properties
const todoPreview: Pick<Todo, 'title' | 'completed'> = {
  title: "Learn TypeScript",
  completed: false
};

// Omit - exclude specific properties
const todoWithoutDescription: Omit<Todo, 'description'> = {
  title: "Learn TypeScript",
  completed: false
};

// Record - key-value pairs
const todosByID: Record<number, Todo> = {
  1: { title: "Learn TypeScript", description: "Study basics", completed: true },
  2: { title: "Learn React", description: "Build components", completed: false }
};

// Mapped types
type ReadonlyTodo = {
  readonly [K in keyof Todo]: Todo[K];
};

// Conditional types
type ExtractStringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
};

// Template literal types
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;  // 'onClick' | 'onFocus' | 'onBlur'
```

## Type Definitions for Common Patterns

### API Types

```typescript
// API request types
interface SearchQueryParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'date' | 'popularity';
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
  filters?: Record<string, string | number | boolean>;
}

// API response types
interface APIResponse<T> {
  data: T;
  meta: {
    status: number;
    message: string;
    timestamp: string;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Example usage
type SearchResponse = APIResponse<PaginatedResponse<SearchResult>>;

// API function types
type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface APIRequestConfig {
  url: string;
  method: APIMethod;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

type APIRequestFunction = <T>(config: APIRequestConfig) => Promise<APIResponse<T>>;
```

### React Component Types

```typescript
// Props types
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

// Component type
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  onClick,
  children,
  className,
}) => {
  // Component implementation
};

// Event handler types
type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
type KeyboardEventHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

// Ref types
type ButtonRef = React.RefObject<HTMLButtonElement>;
type InputRef = React.RefObject<HTMLInputElement>;

// Context types
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Hook return types
interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: InputChangeHandler;
  handleBlur: InputChangeHandler;
  handleSubmit: FormSubmitHandler;
  reset: () => void;
  isSubmitting: boolean;
}
```

### State Management Types

```typescript
// Redux state types
interface RootState {
  auth: AuthState;
  ui: UIState;
  data: DataState;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Redux action types
type AuthActionType = 
  | 'auth/login/pending'
  | 'auth/login/fulfilled'
  | 'auth/login/rejected'
  | 'auth/logout';

interface AuthAction {
  type: AuthActionType;
  payload?: User | string;
}

// Redux thunk types
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Zustand store types
interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Context API types
interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}
```

## Type Safety Best Practices

### Strict Null Checking

Enable `strictNullChecks` in `tsconfig.json` to catch potential null/undefined errors:

```typescript
// With strictNullChecks enabled
function getLength(text: string | null): number {
  // This will error without a null check
  if (text === null) {
    return 0;
  }
  
  // Now TypeScript knows text is a string
  return text.length;
}

// Optional chaining
const name = user?.profile?.name;

// Nullish coalescing
const displayName = user?.name ?? 'Anonymous';
```

### Union Types and Type Guards

Use union types with type guards for flexible, type-safe code:

```typescript
type Result = Success | Error;

interface Success {
  status: 'success';
  data: unknown;
}

interface Error {
  status: 'error';
  message: string;
}

// Type guard function
function isSuccess(result: Result): result is Success {
  return result.status === 'success';
}

function handleResult(result: Result) {
  if (isSuccess(result)) {
    // TypeScript knows result is Success type here
    console.log(result.data);
  } else {
    // TypeScript knows result is Error type here
    console.error(result.message);
  }
}
```

### Discriminated Unions

Use discriminated unions for type-safe handling of different variants:

```typescript
// Action types for state management
type Action =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: number } }
  | { type: 'DELETE_TODO'; payload: { id: number } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      // TypeScript knows action.payload has text property
      return { ...state, todos: [...state.todos, { text: action.payload.text, completed: false }] };
    
    case 'TOGGLE_TODO':
      // TypeScript knows action.payload has id property
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
        )
      };
    
    case 'DELETE_TODO':
      // TypeScript knows action.payload has id property
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };
    
    default:
      return state;
  }
}
```

### Generic Types

Use generics for reusable, type-safe components and functions:

```typescript
// Generic API client
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json() as T;
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

const user = await fetchData<User>('/api/user/1');
console.log(user.name); // TypeScript knows user has name property

// Generic React components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
  renderItem={(item) => item.name}
/>
```

### Utility Types

Use TypeScript's built-in utility types to transform existing types:

```typescript
// Readonly - make all properties readonly
interface User {
  id: number;
  name: string;
}

const user: Readonly<User> = {
  id: 1,
  name: 'John'
};

// user.name = 'Jane'; // Error: Cannot assign to 'name' because it is a read-only property

// Partial - make all properties optional
function updateUser(user: User, updates: Partial<User>) {
  return { ...user, ...updates };
}

// Pick - select specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;

// Omit - exclude specific properties
type PublicUser = Omit<User, 'password' | 'token'>;

// Record - create a type with specified keys and values
type UserRoles = Record<string, 'admin' | 'editor' | 'viewer'>;

// Extract - extract types that are assignable to a specific type
type StringProps<T> = Extract<keyof T, string>;

// Exclude - exclude types that are assignable to a specific type
type NonFunctionProps<T> = Exclude<keyof T, Function>;

// NonNullable - remove null and undefined from a type
type RequiredValue = NonNullable<string | null | undefined>;

// ReturnType - extract the return type of a function
type FetchUserReturn = ReturnType<typeof fetchUser>;

// Parameters - extract the parameter types of a function
type FetchUserParams = Parameters<typeof fetchUser>;

// InstanceType - extract the instance type of a constructor function
type DateInstance = InstanceType<typeof Date>;
```

## TypeScript with React

### Component Types

```typescript
// Function component with props
interface GreetingProps {
  name: string;
  age?: number;
}

const Greeting: React.FC<GreetingProps> = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age !== undefined && <p>You are {age} years old.</p>}
    </div>
  );
};

// With children
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
};

// Generic components
interface SelectProps<T> {
  items: T[];
  selectedItem: T;
  onChange: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function Select<T>({ items, selectedItem, onChange, renderItem }: SelectProps<T>) {
  return (
    <select
      value={items.indexOf(selectedItem).toString()}
      onChange={(e) => onChange(items[parseInt(e.target.value)])}
    >
      {items.map((item, index) => (
        <option key={index} value={index.toString()}>
          {renderItem(item)}
        </option>
      ))}
    </select>
  );
}
```

### Hooks with TypeScript

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<number | null>(null);

// useEffect with cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Timeout completed');
  }, 1000);
  
  return () => {
    clearTimeout(timer);
  };
}, []);

// useReducer
interface State {
  count: number;
}

type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

// useContext
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hooks
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### Event Handling

```typescript
// Button click event
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Button clicked', event.currentTarget.name);
};

// Form submission
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log('Form submitted');
};

// Input change
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log('Input value:', event.target.value);
};

// Keyboard events
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    console.log('Enter key pressed');
  }
};

// Drag events
const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
  console.log('Dragging', event.clientX, event.clientY);
};
```

## TypeScript 5.8 Features

### Using Statement for Resource Management

The `using` statement provides automatic resource management:

```typescript
class DatabaseConnection implements Disposable {
  #isOpen = false;
  
  constructor(private url: string) {
    this.#isOpen = true;
    console.log(`Connected to ${url}`);
  }
  
  query(sql: string): unknown[] {
    if (!this.#isOpen) throw new Error("Connection closed");
    console.log(`Executing: ${sql}`);
    return [];
  }
  
  [Symbol.dispose](): void {
    if (this.#isOpen) {
      this.#isOpen = false;
      console.log("Connection closed");
    }
  }
}

function queryUsers() {
  using connection = new DatabaseConnection("postgres://localhost:5432/mydb");
  
  // Connection is automatically closed when function exits
  return connection.query("SELECT * FROM users");
}
```

### Improved Type Inference

TypeScript 5.8 includes improved type inference for complex scenarios:

```typescript
// Better inference for higher-order functions
function pipe<A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): (a: A) => C {
  return (a) => g(f(a));
}

const toString = (n: number) => String(n);
const length = (s: string) => s.length;

// TypeScript correctly infers the type as (n: number) => number
const numberToLength = pipe(toString, length);

// Enhanced inference for object destructuring
function process<T extends { id: string, data?: unknown }>(obj: T) {
  const { id, data = {} } = obj;
  // TypeScript correctly infers data as unknown
  return { id, data };
}
```

### Decorator Metadata

TypeScript 5.8 supports the decorator metadata proposal:

```typescript
// Define a decorator
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with args: ${JSON.stringify(args)}`);
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2); // Logs: "Calling add with args: [1,2]"
```

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript GitHub Repository](https://github.com/microsoft/TypeScript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Release Notes](https://devblogs.microsoft.com/typescript/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)