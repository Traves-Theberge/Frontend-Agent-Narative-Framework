"use client";
import React from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface ChatHeaderProps {
  onClear: () => void;
  // Add chatTitle prop if needed here later
}

export function ChatHeader({ onClear }: ChatHeaderProps) {
  return (
    // Remove sticky, backdrop-blur, adjust padding/border/bg if needed
    // This header is now *only* for actions within a selected chat
    <div className="flex items-center justify-end p-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex-shrink-0">
      {/* Removed h1 Title */}
      <Button
        variant="ghost"
        size="icon"
        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors h-8 w-8" // Made slightly smaller
        onClick={onClear}
        aria-label="Clear current chat history"
      >
        <Trash2 className="h-4 w-4" /> {/* Made slightly smaller */}
      </Button>
    </div>
  );
}
