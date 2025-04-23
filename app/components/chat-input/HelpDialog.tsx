import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ isOpen, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Help</DialogTitle>
          <DialogDescription>
            Here are some commands and formatting tips you can use:
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-w-none py-2 text-sm">
          <p className="font-semibold">Slash Commands:</p>
          <ul>
            <li><code>/new</code> - Start a new conversation.</li>
            <li><code>/clear</code> - Delete all messages in the current chat.</li>
            <li><code>/help</code> - Show this help dialog.</li>
            {/* Add more commands as they are implemented */} 
          </ul>
          <p className="font-semibold mt-3">Mention Users:</p>
          <ul>
            <li>Type <code>@</code> followed by a name (e.g., <code>@Alice</code>) to mention a user.</li>
          </ul>
          <p className="font-semibold mt-3">Markdown Formatting:</p>
          <ul>
            <li><code>**Bold**</code> &rarr; <strong>Bold</strong></li>
            <li><code>*Italic*</code> or <code>_Italic_</code> &rarr; <em>Italic</em></li>
            <li><code>~~Strikethrough~~</code> &rarr; <del>Strikethrough</del></li>
            <li><code>`Inline code`</code> &rarr; <code>Inline code</code></li>
            <li><code>```\nCode block\n```</code> &rarr; Code block</li>
            <li><code>&gt; Blockquote</code> &rarr; Blockquote</li>
            <li><code>[Link text](https://example.com)</code> &rarr; Link</li>
          </ul>
        </div>
        <DialogFooter className="mt-2 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 