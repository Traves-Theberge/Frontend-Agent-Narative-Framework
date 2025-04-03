# Shadcn UI Implementation Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Version and Documentation: Line ~40
- Architecture Overview: Line ~50
- Installation and Setup: Line ~70
  - Prerequisites: Line ~80
  - Installation Steps: Line ~90
- Component Organization: Line ~120
- Key Components and Usage Patterns: Line ~140
  - Button Component: Line ~150
  - Search Bar Component: Line ~180
  - Card Component: Line ~200
- Customization Strategies: Line ~230
  - Using Class Variance Authority: Line ~240
  - Extending Components: Line ~270
  - Theming: Line ~300
- Performance Considerations: Line ~330
  - Component Memoization: Line ~340
  - Dynamic Imports: Line ~360
- Testing Strategies: Line ~380
- Best Practices: Line ~410
  - Component Naming: Line ~420
  - File Structure: Line ~440
  - Styling: Line ~460
  - Accessibility: Line ~480
  - Reusability: Line ~500

## References

- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [Lucide Icons](https://lucide.dev/icons/)

## Overview

This document provides a technical overview of Shadcn UI, a collection of accessible, customizable UI components built on top of Radix UI primitives with TailwindCSS styling. Shadcn UI offers a unique approach to component libraries by providing components that are copied into your project rather than imported as dependencies.

## Version and Documentation

- **Shadcn UI**: Not versioned (collection of components)
  - **Documentation**: [Shadcn UI Docs](https://ui.shadcn.com/docs)
  - **GitHub**: [shadcn/ui](https://github.com/shadcn/ui)

## Architecture Overview

Shadcn UI is not a traditional component library but a collection of pre-built components using Radix UI primitives with TailwindCSS styling. Key characteristics:

- Offers styled implementations of Radix UI primitives that can be copied into your project
- Components are installed directly into your codebase, not imported from a package
- Fully customizable styling and behavior
- No external dependencies to manage (beyond Radix UI and TailwindCSS)

## Installation and Setup

### Prerequisites

- Next.js, Vite, Remix, Astro, or other modern React framework
- TailwindCSS
- TypeScript (recommended)

### Installation Steps

1. Initialize Shadcn UI in your project:

```bash
# Using npm
npx shadcn-ui@latest init

# Using pnpm
pnpm dlx shadcn-ui@latest init

# Using yarn
yarn dlx shadcn-ui@latest init
```

2. During initialization, you'll be prompted to configure:
   - Style preferences (default, new york, etc.)
   - Global CSS file location
   - Components directory
   - Utility functions location
   - Color preferences
   - Base color for dark mode
   - CSS variable support
   - React Server Components support
   - Import alias path

3. Add components to your project:

```bash
# Add a button component
npx shadcn-ui@latest add button

# Add multiple components
npx shadcn-ui@latest add button card toast

# Add all components
npx shadcn-ui@latest add
```

## Component Organization

Shadcn UI components are typically organized in the following structure:

```
components/
├── ui/                   # Shadcn UI components
│   ├── button.tsx        # Button component
│   ├── card.tsx          # Card component
│   ├── dialog.tsx        # Dialog component
│   └── ...               # Other components
├── icons/                # Icon components
├── layout/               # Layout components
└── [feature]/            # Feature-specific components
```

## Key Components and Usage Patterns

### Button Component

The Button component is a fundamental UI element with various styles and states:

```tsx
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

Usage example:

```tsx
import { Button } from "@/components/ui/button"

export default function ButtonDemo() {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
```

### Search Bar Component

A common pattern for search functionality:

```tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchBar() {
  return (
    <div className="relative flex w-full max-w-sm items-center">
      <Input
        type="search"
        placeholder="Search..."
        className="pr-10"
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full px-3"
        type="submit"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Card Component

A versatile container for content:

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CardExample() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  )
}
```

## Customization Strategies

### Using Class Variance Authority (cva)

Shadcn UI uses `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
```

### Extending Components

You can extend components with additional functionality:

```tsx
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
```

### Theming

Customize the theme by modifying your TailwindCSS configuration:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

## Performance Considerations

### Component Memoization

Memoize components that don't need frequent re-renders:

```tsx
import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string or number
  icon: React.ReactNode
}

const StatCard = memo(({ title, value, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
})
StatCard.displayName = "StatCard"

export { StatCard }
```

### Dynamic Imports

Use dynamic imports for larger components:

```tsx
import dynamic from "next/dynamic"

const DataTable = dynamic(() => import("@/components/data-table"), {
  loading: () => <div>Loading table...</div>,
  ssr: false,
})
```

## Testing Strategies

### Component Testing

Test components using React Testing Library:

```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole("button", { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button", { name: /delete/i })
    expect(button).toHaveClass("bg-destructive")
    expect(button).toHaveClass("text-destructive-foreground")
  })

  it("applies disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled()
  })
})
```

## Best Practices

### Component Naming

- Use PascalCase for component names: `Button`, `Card`, `Dialog`
- Use descriptive names that reflect the component's purpose
- Prefix specialized variants: `LoadingButton`, `IconButton`

### File Structure

- Keep related components in the same file (e.g., `card.tsx` contains `Card`, `CardHeader`, `CardContent`, etc.)
- Place utility functions in a separate file (e.g., `lib/utils.ts`)
- Group related components in subdirectories when they grow in complexity

### Styling

- Use the `cn` utility function to merge class names
- Follow TailwindCSS best practices for styling
- Use CSS variables for theming
- Maintain consistent spacing and sizing

### Accessibility

- Ensure proper ARIA attributes are used
- Maintain keyboard navigation support
- Test with screen readers
- Provide appropriate focus states

### Reusability

- Design components to be reusable across different contexts
- Use props for customization rather than creating multiple similar components
- Document component APIs clearly

### Documentation

- Add JSDoc comments to component props
- Create example usage patterns
- Document any non-obvious behaviors or edge cases

### Testing

- Test component rendering
- Test interactions (clicks, keyboard events)
- Test different states (loading, disabled, etc.)
- Test accessibility features

## References

- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [Lucide Icons](https://lucide.dev/icons/)