import React, { useRef, useEffect, useState, ChangeEvent, KeyboardEvent, DragEvent, ClipboardEvent, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Send, Square, Paperclip, FilePlus, Trash2, HelpCircle, Mic
} from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import type { UseChatHelpers } from 'ai/react';
import { cn } from '@/lib/utils';
import { MAX_INPUT_HISTORY, getDraftKey } from './utils';
import { AttachedFilesPreview } from './AttachedFilesPreview';
import { MarkdownToolbar } from './MarkdownToolbar';
import { AgentModeToggle } from './AgentModeToggle';
import { HelpDialog } from './HelpDialog';
import { CommandPopover } from './CommandPopover';
import { MentionPopover } from './MentionPopover';
import { MockUser, CommandItemDef, AttachedFileState } from './types';
import { Popover, PopoverAnchor } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Mock User Data (Type imported from ./types)
const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'David' },
  { id: '5', name: 'Eve' },
];

// Interface for attached file state (Type imported from ./types)

interface ChatInputProps {
  currentChatId: string | null;
  agentMode: 'normal' | 'think' | 'research';
  setAgentMode: React.Dispatch<React.SetStateAction<'normal' | 'think' | 'research'>>;
  value: string;
  onChange: UseChatHelpers['handleInputChange'];
  onSend: (event?: React.FormEvent<HTMLFormElement> | { preventDefault?: () => void }) => void;
  isLoading: boolean;
  stop: UseChatHelpers['stop'];
  onNewChat: () => void; // Callback to create a new chat
  onClear: () => void; // Callback to clear the current chat
  attachedFiles: AttachedFileState[];
  onAttachFiles: (files: FileList | File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function ChatInput({ 
  value, onChange, onSend, isLoading, stop, onNewChat, onClear, 
  attachedFiles, onAttachFiles, onRemoveFile, currentChatId,
  agentMode, setAgentMode
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // --- Single State for Active Popover --- 
  const [activePopover, setActivePopover] = useState<'none' | 'command' | 'mention'>('none');

  // --- Command State (Search term & selection) ---
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0); 

  // --- Mention State (Filtered list & selection) ---
  const [filteredMentions, setFilteredMentions] = useState<MockUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionTriggerPosition, setMentionTriggerPosition] = useState<number | null>(null);

  // --- Help Dialog State ---
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  // Helper function to clear draft for the current chat, wrapped in useCallback
  const clearDraft = useCallback(() => {
    if (currentChatId) {
      localStorage.removeItem(`draft_${currentChatId}`);
    }
  }, [currentChatId]); // Add currentChatId as dependency

  // Define commands
  const COMMANDS: CommandItemDef[] = useMemo(() => [
    {
      value: "/new",
      label: "New Chat",
      description: "Start a new conversation",
      icon: FilePlus,
      action: () => {
        onNewChat();
        clearDraft(); // Clear draft for previous chat
      }
    },
    {
      value: "/clear",
      label: "Clear Chat",
      description: "Clear messages in the current chat",
      icon: Trash2,
      action: () => {
        onClear();
        clearDraft(); // Clear draft for current chat
        // Optionally clear input after action
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    },
    {
      value: "/help",
      label: "Help",
      description: "Show available commands and tips",
      icon: HelpCircle,
      action: () => {
        setIsHelpDialogOpen(true); // Open the help dialog
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>); // Clear input
      }
    },
    // Add more commands here
  ], [onNewChat, onClear, onChange, clearDraft]); // Add clearDraft to dependencies

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.value.toLowerCase().includes(commandSearch.toLowerCase()) ||
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  // --- Handlers ---

  // Refactored onChange to use single activePopover state
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    onChange(event); // Call the original onChange

    let nextActivePopover: 'none' | 'command' | 'mention' = 'none';
    let newCommandSearch = '';
    let newMentionTriggerPosition: number | null = null;
    let newFilteredMentions: MockUser[] = [];

    if (newValue.startsWith('/')) {
        // Command case
        nextActivePopover = 'command';
        newCommandSearch = newValue.substring(1);
    } else {
        // Not a command case, check for mention
        const cursorPosition = event.target.selectionStart;
        const textBeforeCursor = newValue.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            const currentSearch = mentionMatch[1] || '';
            const matches = MOCK_USERS.filter(user =>
                user.name.toLowerCase().startsWith(currentSearch.toLowerCase())
            );

            if (matches.length > 0) {
                // Mention case
                nextActivePopover = 'mention';
                newFilteredMentions = matches;
                newMentionTriggerPosition = mentionMatch.index ?? null;
            }
        }
    }

    // Update states
    setActivePopover(nextActivePopover);
    setCommandSearch(newCommandSearch);
    setFilteredMentions(newFilteredMentions);
    setMentionTriggerPosition(newMentionTriggerPosition);

    // Reset selection indices if a popover is becoming active
    if (nextActivePopover === 'command') {
      setSelectedCommandIndex(0);
    }
    if (nextActivePopover === 'mention') {
      setSelectedMentionIndex(0);
    }

    // Handle history and focus
    setHistoryIndex(-1);
    if (nextActivePopover === 'none') { 
        textareaRef.current?.focus();
    }
  };

  const handleCommandSelect = (command: CommandItemDef) => {
    setActivePopover('none'); // Close popover after selection
    setCommandSearch(''); 
    
    if (command.action) {
      command.action(); 
    } else {
      onChange({ target: { value: command.value + ' ' } } as React.ChangeEvent<HTMLTextAreaElement>);
      setTimeout(() => { 
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(command.value.length + 1, command.value.length + 1);
      }, 0);
    }
    textareaRef.current?.focus(); 
  };

  // Function to add to history (ensuring no duplicates and limit)
  const addToHistory = (input: string) => {
    if (!input.trim()) return; // Don't save empty input
    setInputHistory(prev => 
      [input, ...prev.filter(item => item !== input)].slice(0, MAX_INPUT_HISTORY)
    );
    setHistoryIndex(-1); // Reset index after sending
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // --- Popover navigation ---
    if (activePopover === 'command' && filteredCommands.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedCommandIndex(prevIndex => 
          prevIndex >= filteredCommands.length - 1 ? 0 : prevIndex + 1
        );
        return; // Prevent cursor move in textarea
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedCommandIndex(prevIndex => 
          prevIndex <= 0 ? filteredCommands.length - 1 : prevIndex - 1
        );
        return; // Prevent cursor move in textarea
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleCommandSelect(filteredCommands[selectedCommandIndex]);
        return; // Prevent form submission/newline
      } else if (event.key === 'Escape') {
        event.preventDefault(); 
        setActivePopover('none'); // Close with Escape
        return; 
      }
    }
    // --- End Command Popover navigation ---

    // --- Mention Popover Navigation ---
    if (activePopover === 'mention' && filteredMentions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedMentionIndex(prevIndex => 
          prevIndex >= filteredMentions.length - 1 ? 0 : prevIndex + 1
        );
        return; 
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedMentionIndex(prevIndex => 
          prevIndex <= 0 ? filteredMentions.length - 1 : prevIndex - 1
        );
        return; 
      } else if (event.key === 'Enter' || event.key === 'Tab') { // Allow Tab to select too
        event.preventDefault();
        handleMentionSelect(filteredMentions[selectedMentionIndex]);
        return;
      } else if (event.key === 'Escape') {
        event.preventDefault(); 
        setActivePopover('none'); // Close with Escape
        return; 
      }
    }
    // --- End Mention Popover Navigation ---

    // Send on Enter (only if no popover is active)
    if (event.key === 'Enter' && !event.shiftKey && activePopover === 'none') {
      event.preventDefault();
      if (!isLoading && (value.trim() || attachedFiles.length > 0)) {
        // --- Call form submit instead of onSend directly ---
        // const currentValue = value;
        // onSend({ preventDefault: () => {} }); // Pass dummy event or undefined
        // clearDraft();
        // addToHistory(currentValue);
        
        // Find the form and submit it programmatically
        const form = (event.target as HTMLElement).closest('form');
        if (form) {
            form.requestSubmit(); // Standard way to trigger form submit
        }
        // --- End change ---
      }
      return; // Prevent further keydown processing for Enter
    }

    // History Navigation (only if no popover is active)
    const cursorPosition = event.currentTarget.selectionStart;
    const textLength = value.length;

    // Arrow Up
    if (activePopover === 'none' && event.key === 'ArrowUp' && cursorPosition === 0) {
      if (historyIndex < inputHistory.length - 1) {
        event.preventDefault();
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        // Manually trigger onChange because we're setting the value directly
        handleInputChange({ target: { value: inputHistory[newIndex] } } as React.ChangeEvent<HTMLTextAreaElement>);
      }
      return;
    }

    // Arrow Down
    if (activePopover === 'none' && event.key === 'ArrowDown' && cursorPosition === textLength) {
      if (historyIndex > -1) {
        event.preventDefault();
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const newValue = newIndex === -1 ? '' : inputHistory[newIndex]; // Go back to empty if reaching end
        handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
      }
      return;
    }

    // If typing any other key while browsing history, reset to current input
    if (historyIndex > -1 && !['ArrowUp', 'ArrowDown', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
        setHistoryIndex(-1);
    }
  };

  useEffect(() => {
    // Focus textarea only if no popover is active
    if (!isLoading && activePopover === 'none') { 
      textareaRef.current?.focus();
    }
  }, [isLoading, activePopover]); // Depend on activePopover

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onAttachFiles(files);
    }
    // Clear the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = ''; 
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    onRemoveFile(indexToRemove);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Don't submit if a command/mention is potentially being selected or input is empty
    if (!isLoading && (value.trim() || attachedFiles.length > 0) && activePopover === 'none') { 
      const currentValue = value; 
      onSend(event);
      clearDraft(); 
      addToHistory(currentValue);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Check if the leave target is outside the main component boundary if needed
    setIsDraggingOver(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow drop
    event.stopPropagation();
    setIsDraggingOver(true); // Keep indicator true while dragging over
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onAttachFiles(files);
      textareaRef.current?.focus();
    }
  };
  // --- End Drag and Drop Handlers ---

  // --- Add Paste Handler ---
  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault(); // Prevent pasting image data as text
      onAttachFiles(imageFiles); // Call parent handler to attach files
      console.log("Pasted images attached:", imageFiles);
    }
    // Allow default paste behavior for non-image content
  };

  // --- Markdown Formatting Handler (Corrected Version) ---
  const applyMarkdownFormat = (syntax: string, block = false) => {
    const textareaElement = textareaRef.current;
    if (!textareaElement) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const currentValue = value; // Get current value from prop
    const selectedText = currentValue.substring(start, end);
    let newValue = '';
    let finalCursorPos = start; // Calculate position here

    const prefix = syntax;
    let suffix = syntax;

    // Adjust for specific syntaxes
    if (syntax === '`') suffix = '`';
    if (syntax === '```') suffix = '\n```';
    if (syntax === '> ') suffix = '';
    if (syntax === '- ') suffix = '';
    if (syntax === '1. ') suffix = '';
    if (syntax === '[]()') suffix = '';

    if (block && syntax === '```') {
      const lang = prompt("Enter language (optional):", "");
      const langStr = lang ? lang : '';
      const blockSyntax = `\n\`\`\`${langStr}\n${selectedText}\n\`\`\`\n`;
      newValue = currentValue.substring(0, start) + blockSyntax + currentValue.substring(end);
      finalCursorPos = start + 4 + langStr.length;
    } else if (syntax === '- ' || syntax === '1. ') {
      const lines = selectedText.split('\n');
      if (selectedText || lines.length > 0) {
        const currentLineStart = currentValue.lastIndexOf('\n', start - 1) + 1;
        const safeEnd = Math.max(start, end); 
        const textToFormat = selectedText || currentValue.substring(currentLineStart, safeEnd);
        const linesToFormat = textToFormat.split('\n');
        const formattedLines = linesToFormat.map((line, index) => 
          (syntax === '1. ' ? `${index + 1}. ` : prefix) + line
        ).join('\n');
        
        if (selectedText) {
          newValue = currentValue.substring(0, start) + formattedLines + currentValue.substring(end);
        } else {
          newValue = currentValue.substring(0, currentLineStart) + formattedLines + currentValue.substring(safeEnd);
        }
        finalCursorPos = start + (syntax === '1. ' ? `1. `.length : prefix.length);
      } else {
        newValue = currentValue.substring(0, start) + prefix + currentValue.substring(end);
        finalCursorPos = start + prefix.length;
      }
    } else if (syntax === '[]()') {
      const url = prompt("Enter URL:", "https://");
      if (!url) return;
      const linkText = selectedText || 'link text';
      const linkSyntax = `[${linkText}](${url})`;
      newValue = currentValue.substring(0, start) + linkSyntax + currentValue.substring(end);
      if (!selectedText) {
        finalCursorPos = start + 1;
      } else {
        finalCursorPos = start + linkSyntax.length;
      }
    } else {
      if (selectedText) {
        newValue = currentValue.substring(0, start) + prefix + selectedText + suffix + currentValue.substring(end);
        finalCursorPos = start + prefix.length + selectedText.length + suffix.length;
      } else {
        newValue = currentValue.substring(0, start) + prefix + suffix + currentValue.substring(end);
        finalCursorPos = start + prefix.length;
      }
    }

    // Pass the calculated position to the timeout
    const cursorTargetPosition = finalCursorPos;

    handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

    // Restore focus and set cursor position using the passed value
    setTimeout(() => {
      const currentTextarea = textareaRef.current; // Re-get ref inside timeout
      if (currentTextarea) {
        currentTextarea.focus();
        currentTextarea.setSelectionRange(cursorTargetPosition, cursorTargetPosition);
      }
    }, 0);
  };

  // --- Mention Selection Handler ---
  const handleMentionSelect = (user: MockUser) => {
    setActivePopover('none'); // Close popover
    setFilteredMentions([]);

    const currentVal = value; 
    if (mentionTriggerPosition === null) return; // Should not happen if popover was open

    const textBefore = currentVal.substring(0, mentionTriggerPosition);
    // Find the end of the mention trigger (e.g., includes the search term)
    const textAfterTrigger = currentVal.substring(mentionTriggerPosition);
    const spaceAfterMatch = textAfterTrigger.search(/s|$/); // Find next space or end of string
    const endOfTrigger = mentionTriggerPosition + (spaceAfterMatch > -1 ? spaceAfterMatch : textAfterTrigger.length);

    const mentionText = `@${user.name} `;
    const newValue = 
      textBefore + 
      mentionText + 
      currentVal.substring(endOfTrigger);

    onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

    // Set cursor position after the inserted mention
    setTimeout(() => { 
      textareaRef.current?.focus();
      const finalCursorPos = mentionTriggerPosition + mentionText.length;
      textareaRef.current?.setSelectionRange(finalCursorPos, finalCursorPos);
    }, 0);

    setMentionTriggerPosition(null);
  };

  // --- Draft Saving/Loading ---
  // Uses getDraftKey from utils

  // Load draft on mount/chat change
  useEffect(() => {
    const draftKey = getDraftKey(currentChatId);
    if (draftKey) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && !value) { // Only load if input is currently empty
        // Use handleInputChange to ensure command/mention detection also runs
        handleInputChange({ target: { value: savedDraft } } as React.ChangeEvent<HTMLTextAreaElement>);
        console.log(`Loaded draft for chat ${currentChatId}`);
      }
    }
    // Intentionally only run when currentChatId changes, not value
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentChatId]);

  // Save draft with debounce
  useEffect(() => {
    const draftKey = getDraftKey(currentChatId);
    if (!draftKey) return; // Don't save if no active chat

    // Simple debounce using setTimeout
    const handler = setTimeout(() => {
      if (value) {
        localStorage.setItem(draftKey, value);
      } else {
        // Remove key if value becomes empty
        localStorage.removeItem(draftKey);
      }
    }, 500); // Save after 500ms of inactivity

    // Cleanup function to clear timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, currentChatId]); // Rerun when value or chatId changes

  return (
    <TooltipProvider delayDuration={100}>
      <div 
        className={cn(
          "flex flex-col transition-colors",
          isDraggingOver && "bg-indigo-50 dark:bg-indigo-900/30"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <AttachedFilesPreview 
           attachedFiles={attachedFiles} 
           onRemoveFile={handleRemoveFile} 
        />
        <MarkdownToolbar applyMarkdownFormat={applyMarkdownFormat} />

        <form
          className="flex items-center space-x-2"
          onSubmit={handleFormSubmit}
        >
          <Popover 
            open={activePopover !== 'none'}
            onOpenChange={(open) => {
              if (!open) setActivePopover('none');
            }}
          >
            <PopoverAnchor asChild>
              <div
                className={cn(
                  "relative flex items-end space-x-2 overflow-hidden flex-grow",
                  "px-2.5 py-1.5",
                  "min-h-[48px]",
                  "border rounded-lg", 
                  "bg-background border-input", 
                  "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:focus-within:ring-offset-background", 
                  "transition-all duration-150 ease-in-out",
                  agentMode !== 'normal' && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    aria-hidden="true"
                  />
                  <AgentModeToggle
                    agentMode={agentMode}
                    setAgentMode={setAgentMode}
                    isLoading={isLoading}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-800 rounded-lg" 
                        disabled={isLoading} 
                        aria-label="Voice Input"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Voice Input</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-800 rounded-lg" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isLoading} 
                        aria-label="Attach File"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Attach File</p></TooltipContent>
                  </Tooltip>
                </div>

                <TextareaAutosize
                  ref={textareaRef}
                  name="prompt"
                  value={value}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Send a message..." 
                  disabled={isLoading}
                  className={cn(
                    "w-full resize-none flex-grow self-end",
                    "bg-transparent", 
                    "py-0.5",
                    "text-sm md:text-base placeholder:text-muted-foreground",
                    "text-foreground",
                    "border-none focus:ring-0 focus:outline-none shadow-none", 
                    "peer" 
                  )}
                  autoComplete="off"
                  maxRows={8}
                  minRows={1} 
                />

                <div className="flex items-center flex-shrink-0">
                  {isLoading ? (
                    <Button 
                      type="button" 
                      onClick={stop} 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-red-500 hover:bg-red-100 focus-visible:bg-red-100 dark:hover:bg-red-900/30 dark:focus-visible:bg-red-900/30 rounded-lg" 
                      aria-label="Stop generation"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={(!value.trim() || value.startsWith('/')) && attachedFiles.length === 0} 
                      size="icon" 
                      className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-primary/70 transition-all"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {activePopover === 'command' && (
                  <CommandPopover 
                    isOpen={true} 
                    onOpenChange={(open) => !open && setActivePopover('none')} 
                    commands={filteredCommands} 
                    selectedIndex={selectedCommandIndex} 
                    onSelectCommand={handleCommandSelect} 
                  />
                )}
                {activePopover === 'mention' && (
                  <MentionPopover 
                    isOpen={true} 
                    onOpenChange={(open) => !open && setActivePopover('none')} 
                    mentions={filteredMentions} 
                    selectedIndex={selectedMentionIndex} 
                    onSelectMention={handleMentionSelect} 
                  />
                )}
              </div>
            </PopoverAnchor>
          </Popover>
        </form> 

        <HelpDialog isOpen={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen} />

      </div>
    </TooltipProvider>
  );
} 