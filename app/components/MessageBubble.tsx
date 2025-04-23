"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './renderers/MarkdownRenderer';
import { ArtifactRenderer } from './renderers/ArtifactRenderer';
import { MermaidRenderer } from './renderers/MermaidRenderer';
import type { AppMessage } from '../../lib/types';

const PyodideRunner = dynamic(
  () => import('./renderers/PyodideRunner').then((mod) => mod.PyodideRunner),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-xs text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg my-2">
        Loading Python Environment...
      </div>
    ),
  }
);

interface MessageBubbleProps {
    message: AppMessage;
    onRunPython?: (code: string, messageId: string) => void;
}

export function MessageBubble({ message, onRunPython }: MessageBubbleProps) {
  const { id, role, content } = message;
  const isUser = role === 'user';

  const renderContent = () => {
    switch (content.type) {
      case 'html':
        return <ArtifactRenderer content={content.html} type="html" />;
      case 'svg':
        return <ArtifactRenderer content={content.svg} type="svg" />;
      case 'mermaid':
        return <MermaidRenderer syntax={content.syntax} />;
      case 'python':
        return <PyodideRunner code={content.code} initialAutoRun={role === 'assistant'} />;
      case 'text':
        return <MarkdownRenderer content={content.text} messageId={id} onRunPython={onRunPython} />;
      default:
        const unknownType = (content as Record<string, unknown>)?.type ?? 'unknown';
        const typeString = typeof unknownType === 'string' ? unknownType : JSON.stringify(unknownType);
        console.warn(`MessageBubble encountered unknown content type: ${typeString}. Rendering nothing or an error.`);
        return <div className="text-red-500 italic text-xs">[Unsupported content type: {typeString}]</div>;
    }
  };

  const needsBubbleStyle = content.type === 'text';

  const removePadding = content.type === 'html' || content.type === 'svg' || content.type === 'mermaid' || content.type === 'python';

  return (
    <div
      className={cn(
        'flex w-full items-start gap-2 md:gap-3'
      )}
      key={id}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border border-border flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          <AvatarFallback className="text-xs text-muted-foreground">AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[90%] md:max-w-[95%] rounded-xl break-words shadow-md text-sm md:text-base overflow-hidden',
          needsBubbleStyle && (
            isUser
              ? 'bg-slate-700 text-slate-50'
              : 'bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700'
          ),
          !removePadding && 'px-4 py-2.5',
          removePadding && 'p-0 bg-transparent shadow-none border-none',
        )}
      >
        {renderContent()}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border border-border flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          <AvatarFallback className="text-xs text-muted-foreground">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
