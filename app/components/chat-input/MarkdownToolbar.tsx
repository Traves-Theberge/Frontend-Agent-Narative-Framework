import React from 'react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Bold, Italic, Strikethrough, Code, Quote, Link2, List, ListOrdered 
} from "lucide-react";

interface MarkdownToolbarProps {
  applyMarkdownFormat: (syntax: string, block?: boolean) => void;
}

export function MarkdownToolbar({ applyMarkdownFormat }: MarkdownToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 md:px-3 py-1 pb-1.5">
      {/* Toggle Group for Bold/Italic/Strikethrough */}
      <ToggleGroup type="multiple" size="sm" className="gap-0.5">
        <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-7 w-7 px-1.5 data-[state=on]:bg-neutral-200 dark:data-[state=on]:bg-neutral-700" onClick={() => applyMarkdownFormat('**')}>
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" className="h-7 w-7 px-1.5 data-[state=on]:bg-neutral-200 dark:data-[state=on]:bg-neutral-700" onClick={() => applyMarkdownFormat('*')}>
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" className="h-7 w-7 px-1.5 data-[state=on]:bg-neutral-200 dark:data-[state=on]:bg-neutral-700" onClick={() => applyMarkdownFormat('~~')}>
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700 mx-1"></div> {/* Separator */}

      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('`')} aria-label="Inline Code">
        <Code size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('> ', true)} aria-label="Blockquote">
          <Quote size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('[]()')} aria-label="Insert Link">
          <Link2 size={15} />
      </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('```', true)} aria-label="Code Block">
          <Code size={15} />
      </Button>
      <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('- ')} aria-label="Bulleted List">
          <List size={15} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => applyMarkdownFormat('1. ')} aria-label="Numbered List">
          <ListOrdered size={15} />
      </Button>
    </div>
  );
} 