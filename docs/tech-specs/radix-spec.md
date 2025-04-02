# Radix UI Implementation Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Version and Documentation: Line ~40
- Architecture Overview: Line ~50
- Installation and Setup: Line ~70

### Core Components
- Dialog: Line ~90
- Dropdown Menu: Line ~120
- Tabs: Line ~150
- Styling Approaches: Line ~180

### Advanced Usage
- Accessibility Features: Line ~210
- Controlled Components: Line ~240
- Composition with Libraries: Line ~260
- Custom Styling: Line ~280

### Technical Considerations
- Performance Optimization: Line ~310
- Testing Strategies: Line ~340
- Best Practices: Line ~370

## References

- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Radix UI GitHub Repository](https://github.com/radix-ui/primitives)
- [Radix UI Examples](https://www.radix-ui.com/docs/primitives/overview/examples)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Overview

This document provides a technical overview of Radix UI, a collection of low-level, unstyled, and accessible UI primitives that serve as the foundation for building robust design systems and component libraries. Radix UI focuses on functionality, accessibility, and developer experience while leaving styling decisions to the implementation.

## Version and Documentation

- **Radix UI**: v2.x
  - **Documentation**: [Radix UI Docs](https://www.radix-ui.com/docs/primitives/overview/introduction)
  - **GitHub**: [radix-ui/primitives](https://github.com/radix-ui/primitives)

## Architecture Overview

Radix UI provides unstyled, accessible UI primitives that can be composed to build a complete design system. Key characteristics:

- Headless UI components with no default styling
- Strong focus on accessibility
- Composable component APIs
- Comprehensive keyboard navigation support
- WAI-ARIA compliant
- Fully typed with TypeScript

## Installation and Setup

### Installation

```bash
# Using npm
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# Add other primitives as needed

# Using yarn
yarn add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# Add other primitives as needed

# Using pnpm
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# Add other primitives as needed
```

Each Radix UI primitive is published as a separate package, allowing you to install only what you need.

## Core Primitives

### Dialog

The Dialog primitive provides a modal window that overlays the page content:

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

export function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="button">Open Dialog</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <Dialog.Title className="text-xl font-bold">Dialog Title</Dialog.Title>
          <Dialog.Description className="text-gray-600 mt-2">
            This is a description of the dialog content.
          </Dialog.Description>
          <div className="mt-4">
            <p>Dialog content goes here.</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button className="button-secondary">Cancel</button>
            <button className="button-primary">Save</button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Dropdown Menu

The Dropdown Menu primitive provides a menu that appears when a trigger element is clicked:

```tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export function DropdownMenuExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="button">Options</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="bg-white rounded-md shadow-lg p-2 min-w-[220px]"
          sideOffset={5}
        >
          <DropdownMenu.Item className="dropdown-item">
            New Tab
          </DropdownMenu.Item>
          <DropdownMenu.Item className="dropdown-item">
            New Window
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="dropdown-item flex items-center justify-between">
              <span>More Tools</span>
              <ChevronRightIcon />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent 
                className="bg-white rounded-md shadow-lg p-2 min-w-[220px]"
                sideOffset={2}
                alignOffset={-5}
              >
                <DropdownMenu.Item className="dropdown-item">
                  Save Page As...
                </DropdownMenu.Item>
                <DropdownMenu.Item className="dropdown-item">
                  Create Shortcut...
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.CheckboxItem 
            className="dropdown-item flex items-center"
            checked={true}
          >
            <DropdownMenu.ItemIndicator className="mr-2">
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            Show Bookmarks
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### Tabs

The Tabs primitive provides a set of layered sections of content:

```tsx
import * as Tabs from '@radix-ui/react-tabs';

export function TabsExample() {
  return (
    <Tabs.Root defaultValue="tab1" className="w-full max-w-md">
      <Tabs.List className="flex border-b" aria-label="Manage your account">
        <Tabs.Trigger
          className="px-4 py-2 flex-1 text-center border-b-2 border-transparent data-[state=active]:border-blue-500"
          value="tab1"
        >
          Account
        </Tabs.Trigger>
        <Tabs.Trigger
          className="px-4 py-2 flex-1 text-center border-b-2 border-transparent data-[state=active]:border-blue-500"
          value="tab2"
        >
          Password
        </Tabs.Trigger>
        <Tabs.Trigger
          className="px-4 py-2 flex-1 text-center border-b-2 border-transparent data-[state=active]:border-blue-500"
          value="tab3"
        >
          Notifications
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="p-4" value="tab1">
        <h3 className="text-lg font-medium">Account settings</h3>
        <p className="mt-2 text-gray-600">Manage your account information.</p>
        {/* Account form fields */}
      </Tabs.Content>
      <Tabs.Content className="p-4" value="tab2">
        <h3 className="text-lg font-medium">Password</h3>
        <p className="mt-2 text-gray-600">Change your password.</p>
        {/* Password form fields */}
      </Tabs.Content>
      <Tabs.Content className="p-4" value="tab3">
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="mt-2 text-gray-600">Configure notification settings.</p>
        {/* Notification settings */}
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

## Styling Approaches

Radix UI components are unstyled by default, giving you complete control over their appearance. Here are common styling approaches:

### CSS Classes

```tsx
import * as Accordion from '@radix-ui/react-accordion';
import './accordion.css'; // Import CSS file

export function AccordionExample() {
  return (
    <Accordion.Root className="accordion" type="single" defaultValue="item-1" collapsible>
      <Accordion.Item className="accordion-item" value="item-1">
        <Accordion.Trigger className="accordion-trigger">
          Section 1
        </Accordion.Trigger>
        <Accordion.Content className="accordion-content">
          Content for section 1
        </Accordion.Content>
      </Accordion.Item>
      {/* More items */}
    </Accordion.Root>
  );
}
```

### CSS-in-JS

```tsx
import * as Tooltip from '@radix-ui/react-tooltip';
import styled from 'styled-components';

const StyledContent = styled(Tooltip.Content)`
  background-color: #333;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

export function TooltipExample() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <StyledContent sideOffset={5}>
            Tooltip content
            <Tooltip.Arrow fill="#333" />
          </StyledContent>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

### Tailwind CSS

```tsx
import * as Switch from '@radix-ui/react-switch';

export function SwitchExample() {
  return (
    <div className="flex items-center">
      <label className="text-sm mr-2" htmlFor="airplane-mode">
        Airplane Mode
      </label>
      <Switch.Root
        className="w-10 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors"
        id="airplane-mode"
      >
        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform data-[state=checked]:translate-x-4" />
      </Switch.Root>
    </div>
  );
}
```

## Accessibility Features

Radix UI primitives are built with accessibility in mind:

### Keyboard Navigation

```tsx
// Keyboard navigation is built-in
// For example, in a Dialog:
// - Escape: Close the dialog
// - Tab: Navigate between focusable elements
// - Shift+Tab: Navigate backwards

// In a Dropdown Menu:
// - Arrow keys: Navigate between items
// - Enter/Space: Select the focused item
// - Escape: Close the menu
```

### Screen Reader Support

```tsx
// Radix UI automatically adds appropriate ARIA attributes
// For example, a Dialog automatically:
// - Sets aria-modal="true"
// - Manages focus when opened
// - Provides aria-labelledby and aria-describedby
```

### Focus Management

```tsx
// Radix UI handles focus management automatically
// For example, when a Dialog opens:
// - Focus is trapped inside the dialog
// - Focus returns to the trigger element when closed
```

## Advanced Usage

### Controlled Components

```tsx
import * as Accordion from '@radix-ui/react-accordion';
import { useState } from 'react';

export function ControlledAccordion() {
  const [value, setValue] = useState('item-1');
  
  return (
    <Accordion.Root
      type="single"
      value={value}
      onValueChange={setValue}
      className="accordion"
    >
      <Accordion.Item className="accordion-item" value="item-1">
        <Accordion.Trigger className="accordion-trigger">
          Section 1
        </Accordion.Trigger>
        <Accordion.Content className="accordion-content">
          Content for section 1
        </Accordion.Content>
      </Accordion.Item>
      {/* More items */}
    </Accordion.Root>
  );
}
```

### Composition with Other Libraries

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>Open Dialog</button>
      </Dialog.Trigger>
      <AnimatePresence>
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Dialog.Title className="text-xl font-bold">
                Animated Dialog
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                This dialog animates in and out using Framer Motion.
              </Dialog.Description>
              <Dialog.Close asChild>
                <button className="absolute top-4 right-4">Close</button>
              </Dialog.Close>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
```

### Custom Styling with Data Attributes

```tsx
import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export function CollapsibleExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <Collapsible.Root
      className="border rounded-md overflow-hidden"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.Trigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100">
        <span>Toggle content</span>
        <ChevronDownIcon className="transition-transform duration-300 data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
        <div className="p-4">
          <p>Collapsible content that animates based on state.</p>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
```

## Performance Considerations

### Component Memoization

```tsx
import * as Select from '@radix-ui/react-select';
import { memo } from 'react';

// Memoize complex select items
const SelectItem = memo(({ value, children }: { value: string; children: React.ReactNode }) => (
  <Select.Item className="select-item" value={value}>
    <Select.ItemText>{children}</Select.ItemText>
    <Select.ItemIndicator className="select-item-indicator">
      ✓
    </Select.ItemIndicator>
  </Select.Item>
));

// Use in a large list
export function LargeSelect() {
  return (
    <Select.Root>
      <Select.Trigger className="select-trigger">
        <Select.Value placeholder="Select an option" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content">
          <Select.Viewport>
            {Array.from({ length: 100 }, (_, i) => (
              <SelectItem key={i} value={`item-${i}`}>
                Option {i + 1}
              </SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

### Virtualization for Large Lists

```tsx
import * as Select from '@radix-ui/react-select';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedSelect() {
  const options = Array.from({ length: 10000 }, (_, i) => ({
    value: `item-${i}`,
    label: `Option ${i + 1}`
  }));
  
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // estimated height of each item
  });
  
  return (
    <Select.Root>
      <Select.Trigger className="select-trigger">
        <Select.Value placeholder="Select from 10,000 options" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content">
          <div ref={parentRef} style={{ height: '300px', overflow: 'auto' }}>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => (
                <Select.Item
                  key={virtualItem.key}
                  value={options[virtualItem.index].value}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <Select.ItemText>{options[virtualItem.index].label}</Select.ItemText>
                </Select.Item>
              ))}
            </div>
          </div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

## Testing Strategies

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DialogExample } from './DialogExample';

describe('DialogExample', () => {
  it('opens the dialog when trigger is clicked', async () => {
    render(<DialogExample />);
    
    // Dialog content should not be in the document initially
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    
    // Click the trigger button
    await userEvent.click(screen.getByRole('button', { name: /open dialog/i }));
    
    // Dialog content should now be in the document
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });
  
  it('closes the dialog when close button is clicked', async () => {
    render(<DialogExample />);
    
    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Click the close button
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    
    // Dialog content should no longer be in the document
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });
  
  it('closes the dialog when escape key is pressed', async () => {
    render(<DialogExample />);
    
    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    
    // Press escape key
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });
    
    // Dialog content should no longer be in the document
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });
});
```

## Best Practices

### Component Organization

- Group related Radix UI components together
- Create wrapper components for commonly used patterns
- Use consistent naming conventions

### Accessibility

- Always provide accessible labels for interactive elements
- Test with keyboard navigation
- Ensure proper focus management
- Test with screen readers

### Styling

- Use consistent styling patterns across components
- Leverage data attributes for state-based styling
- Consider creating a design system on top of Radix UI primitives

### Performance

- Memoize complex components
- Use virtualization for large lists
- Avoid unnecessary re-renders with controlled components