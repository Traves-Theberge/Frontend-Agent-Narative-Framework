'use client';

import React, { useRef } from 'react';
import { type UseChatHelpers } from 'ai/react';
import { MessageList } from './MessageList';
import { ChatInput } from './chat-input/ChatInput';

// Make sure AttachedFileState is defined or imported if needed elsewhere
// If only used here, defining locally is fine.
// REMOVED - interface AttachedFileState {
//   file: File;
//   previewUrl: string | null;
// }

// Add PyExecutionResult type import if needed, or define inline if simple
interface PyExecutionResult {
  status: 'idle' | 'loading' | 'queued' | 'executing' | 'executed' | 'error';
  output: string[];
  error: string | null;
}

// Define the props expected by ChatInterface
interface ChatInterfaceProps extends Pick<UseChatHelpers, 'messages' | 'input' | 'handleInputChange' | 'handleSubmit' | 'isLoading' | 'stop' | 'append'> {
  currentChatId: string | null;
  agentMode: 'normal' | 'think' | 'research';
  setAgentMode: React.Dispatch<React.SetStateAction<'normal' | 'think' | 'research'>>;
  onClear: () => void;
  onNewChat: () => void;
  attachedFiles: { file: File; previewUrl: string | null }[];
  onAttachFiles: (files: FileList | File[]) => void;
  onRemoveFile: (index: number) => void;
  onRunPython?: (code: string, messageId: string) => void;
  pyExecutionResults?: Record<string, PyExecutionResult>;
}

export function ChatInterface({
  currentChatId,
  agentMode,
  setAgentMode,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  append,
  onClear,
  onNewChat,
  attachedFiles,
  onAttachFiles,
  onRemoveFile,
  onRunPython,
  pyExecutionResults,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-800">
      {/* ChatHeader component removed */}
      {/* 
      <ChatHeader
        onClear={onClear}
      /> 
      */}

      {/* Wrapper for MessageList */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Centering Container */}
        <div className="max-w-3xl mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            append={append}
            onRunPython={onRunPython}
            pyExecutionResults={pyExecutionResults}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* Input Area Container */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8">
        <ChatInput
            {...{
              currentChatId,
              agentMode,
              setAgentMode,
              value: input,
              onChange: handleInputChange,
              onSend: handleSubmit,
              isLoading,
              stop,
              onClear,
              onNewChat,
              attachedFiles,
              onAttachFiles,
              onRemoveFile
            }}
        />
      </div>
    </div>
  );
}
