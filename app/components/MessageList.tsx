"use client";
import React, { RefObject, useRef, useEffect } from 'react';
import { Message, type UseChatHelpers } from 'ai/react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { MemoizedMessageItem } from './MessageItem';
import { isUserActionData } from '../chat/types';
import { ArtifactViewer } from './renderers/ArtifactViewer';

function extractArtifactCode(content: string): string | null {
  const match = content.match(/```artifact\s*\n([\s\S]*?)\s*\n```/i);
  return match ? match[1].trim() : null;
}

interface PyExecutionResult {
  status: 'idle' | 'loading' | 'queued' | 'executing' | 'executed' | 'error';
  output: string[];
  error: string | null;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  append: UseChatHelpers['append'];
  onRunPython?: (code: string, messageId: string) => void;
  pyExecutionResults?: Record<string, PyExecutionResult>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isLoading, append, onRunPython, pyExecutionResults, messagesEndRef }: MessageListProps) {
  const nonActionMessages = messages.filter(
    m => !(m.role === 'user' && isUserActionData(m.data))
  );

  const messagesEndRefInternal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore original scrollIntoView logic
    const targetRef = messagesEndRef?.current ? messagesEndRef : messagesEndRefInternal;
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesEndRef]); // Add messagesEndRef here

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
      {/* Revert to single map structure */}
      {nonActionMessages.map((m, index) => {
        // Calculate conditions first
        const isLastMessage = index === nonActionMessages.length - 1;
        const isAssistant = m.role === 'assistant';
        const extractedCode = extractArtifactCode(m.content); // Extract only once

        // Determine if artifact should be rendered
        const shouldRenderArtifact = isAssistant && !isLoading && isLastMessage && !!extractedCode;

        return (
          <React.Fragment key={m.id}>
            <MemoizedMessageItem
              message={m}
              append={append}
              onRunPython={onRunPython}
              pyExecutionResults={pyExecutionResults}
            />
            {/* Render ArtifactViewer conditionally based on calculated artifactCode and the restored condition */}
            {shouldRenderArtifact && extractedCode && (
              <div className="ml-10 md:ml-11 mt-2 mb-2">
                <ArtifactViewer code={extractedCode} />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {isLoading && (
        <div className="flex items-start gap-3 justify-start">
          <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-neutral-200 dark:bg-neutral-700">
            <AvatarFallback className="text-xs text-neutral-600 dark:text-neutral-300">AI</AvatarFallback>
          </Avatar>
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg px-4 py-2 max-w-[75%] md:max-w-[70%]">
            <Skeleton className="h-4 w-16 bg-neutral-300 dark:bg-neutral-600" />
          </div>
        </div>
      )}

      {nonActionMessages.length === 0 && !isLoading && (
        <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm md:text-base py-8">
          Start the conversation by sending a message below.
        </p>
      )}

      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start pl-12 md:pl-13">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">AI is thinking...</span>
        </div>
      )}

      <div ref={messagesEndRefInternal} />
    </div>
  );
}
