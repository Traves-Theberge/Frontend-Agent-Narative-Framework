import React from 'react';
import {
  // Popover, // Remove Popover import
  PopoverContent, 
  // PopoverAnchor // Remove PopoverAnchor import
} from "@/components/ui/popover";
import { 
  Command, 
  // CommandEmpty, // Remove unused import
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { MockUser } from './types'; // Import shared type

// Mock User Data structure (Type imported from ./types)

interface MentionPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mentions: MockUser[];
  selectedIndex: number;
  onSelectMention: (user: MockUser) => void;
}

export function MentionPopover({
  mentions,
  selectedIndex,
  onSelectMention,
}: MentionPopoverProps) {
  // Directly return the PopoverContent element
  return (
      <PopoverContent 
          className="w-[--radix-popover-trigger-width] max-h-48 overflow-y-auto p-0 shadow-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 scrollbar-thin"
          style={{ marginBottom: '8px' }} 
          side="top" 
          align="start" 
          sideOffset={5}
          onOpenAutoFocus={(e) => e.preventDefault()} 
          onCloseAutoFocus={(e) => e.preventDefault()} 
      >
          {mentions.length > 0 ? (
            <Command shouldFilter={false} className="[&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-1.5 [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
                <CommandList>
                {mentions.map((user, index) => (
                  <CommandItem
                    key={user.id}
                    value={user.name} 
                    onSelect={() => onSelectMention(user)} 
                    className={cn(
                      "aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800",
                      index === selectedIndex && "bg-neutral-100 dark:bg-neutral-800" 
                    )}
                  >
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">{user.name}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          ) : (
            <div className="p-2 text-center text-xs text-neutral-500 dark:text-neutral-400">No users found</div>
          )}
      </PopoverContent>
  );
} 