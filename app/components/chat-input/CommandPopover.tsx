import React from 'react';
import {
  // Popover, // Remove Popover import - It's no longer used here
  PopoverContent, 
} from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { CommandItemDef } from './types'; // Import shared type

// Command definition (Type imported from ./types)

interface CommandPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItemDef[];
  selectedIndex: number;
  onSelectCommand: (command: CommandItemDef) => void;
  // anchorElement?: HTMLElement | null; // Optional if PopoverAnchor in parent works
}

export function CommandPopover({
  commands,
  selectedIndex,
  onSelectCommand,
}: CommandPopoverProps) {
  // Directly return the PopoverContent element
  return (
    <PopoverContent 
      className="w-[--radix-popover-trigger-width] p-0 shadow-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
      style={{ marginBottom: '8px' }} 
      side="top" 
      align="start" 
      sideOffset={5}
      onOpenAutoFocus={(e) => e.preventDefault()} 
      onCloseAutoFocus={(e) => e.preventDefault()} 
    >
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500 dark:[&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            {commands.length > 0 && (
              <CommandGroup heading="Commands">
                {commands.map((command, index) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => onSelectCommand(command)}
                    className="cursor-pointer aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800"
                    data-selected={index === selectedIndex}
                  >
                    <command.icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{command.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{command.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
    </PopoverContent>
  );
} 