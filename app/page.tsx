'use client'; // Make this a Client Component

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat, type Message } from 'ai/react';
import { nanoid } from 'nanoid'; // For generating unique chat IDs
import { MessageSquare } from 'lucide-react'; // Import the icon
import { toast } from "sonner"; // Import toast from sonner

import { ChatInterface } from "@/components/ChatInterface";
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar';
import { Skeleton } from '@/components/ui/skeleton';
// Removed isUserActionData import, now handled in storage.ts
// --- Import storage functions and ChatHistoryItem type ---
import {
  loadChats,
  saveChats,
  loadMessages,
  saveMessages,
  loadCurrentChatId,
  saveCurrentChatId,
  deleteChatMessages,
  type ChatHistoryItem
} from '@/lib/storage'; // Corrected path using alias

// --- Interface for attached file state (Lifted Up) ---
interface AttachedFileState {
  file: File;
  previewUrl: string | null;
  error: string | null;
}

// --- NEW: Interface for Python execution results state ---
interface PyExecutionResult {
  status: 'idle' | 'loading' | 'queued' | 'executing' | 'executed' | 'error';
  output: string[]; // Store stdout lines
  error: string | null;
}

// Allowed text MIME types for content injection
const ALLOWED_TEXT_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
  'text/css',
  'application/javascript',
  'application/json',
  // Add more as needed
];

// --- Fallback Component --- (remains the same)
function ChatInterfaceFallback() {
  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center p-4">
      <Skeleton className="h-16 w-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileState[]>([]);
  // --- Add state for sidebar collapse ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // --- Add state for Agent Mode ---
  const [agentMode, setAgentMode] = useState<'normal' | 'think' | 'research'>('normal');

  // --- NEW: State and Ref for Pyodide Worker ---
  const pyodideWorkerRef = useRef<Worker | null>(null);
  const [pyodideStatus, setPyodideStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [pyExecutionResults, setPyExecutionResults] = useState<Record<string, PyExecutionResult>>({});
  const isCreatingChatRef = useRef(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const loadedChats = loadChats();
    console.log("[Mount] Loaded chats:", loadedChats);
    setChats(loadedChats);
    const savedChatId = loadCurrentChatId();
    console.log("[Mount] Loaded currentChatId:", savedChatId);
    setCurrentChatId(savedChatId ?? loadedChats[0]?.id ?? null);
    setIsClient(true); // Indicate client-side rendering is ready
  }, []);

  // --- Add useEffect for attached file cleanup ---
  useEffect(() => {
    // Return cleanup function
    return () => {
      attachedFiles.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [attachedFiles]); // Run cleanup when attachedFiles state changes

  // Load messages for the current chat
  const initialMessages = isClient && currentChatId ? loadMessages(currentChatId) : [];

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    append,
    setMessages,
    stop
  } = useChat({
    // Key changes when currentChatId changes, re-initializing useChat for the selected chat
    key: currentChatId ?? 'no-chat',
    initialMessages: initialMessages,
    // Add other useChat options if needed (e.g., api endpoint)
    // api: '/api/chat'
    // Add onError callback
    onError: (error) => {
        console.error("Chat API Error:", error);
        toast.error("Chat Error", {
          description: error.message || "An unexpected error occurred with the chat API."
        });
    },
  });

  // Save messages whenever they change for the current chat
  useEffect(() => {
    if (isClient && currentChatId && messages.length > 0) {
      saveMessages(currentChatId, messages);

      // Update title and lastUpdated timestamp
      setChats(prevChats => {
        const firstUserMessage = messages.find(m => m.role === 'user');
        const newTitle = firstUserMessage
          ? firstUserMessage.content.substring(0, 15) + (firstUserMessage.content.length > 15 ? '...' : '')
          : prevChats.find(c => c.id === currentChatId)?.title; // Keep existing title if no user message yet

        const now = Date.now();
        let chatUpdated = false;

        const updatedChats = prevChats.map(chat => {
          if (chat.id === currentChatId) {
            // Check if title or timestamp needs update
            if (chat.title !== newTitle || chat.lastUpdated < now - 1000) { // Update if title changes or timestamp is old
              chatUpdated = true;
              return { ...chat, title: newTitle ?? chat.title, lastUpdated: now };
            }
          }
          return chat;
        });

        // Only save if an update actually occurred
        if (chatUpdated) {
          saveChats(updatedChats);
          return updatedChats;
        }

        return prevChats; // Return previous state if no changes
      });
    }
  }, [messages, currentChatId, isClient]);

  // --- NEW: Handler to toggle sidebar ---
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
    // Consider saving preference to localStorage if needed
  };

  // Select a chat
  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    saveCurrentChatId(chatId);
    // useChat will re-initialize due to key change
  }, []);

  // --- Modified handleNewChat with lock ---
  const handleNewChat = useCallback(() => {
    // Check the lock
    if (isCreatingChatRef.current) {
      console.warn('[handleNewChat] Already creating chat, preventing duplicate execution.');
      return;
    }

    try {
      // Set the lock
      isCreatingChatRef.current = true;

      console.log("[handleNewChat] Started. Current chats state:", chats);
      const newChatId = nanoid(8);
      const newChat: ChatHistoryItem = {
        id: newChatId,
        title: "New Chat", // Consider limiting initial title here too if desired
        lastUpdated: Date.now(),
        isPinned: false,
        isArchived: false,
      };
      const updatedChats = [newChat, ...chats];
      console.log("[handleNewChat] Intending to set chats to:", updatedChats);
      setChats(updatedChats);
      saveChats(updatedChats);
      console.log("[handleNewChat] Saved chats to localStorage.");
      setCurrentChatId(newChatId);
      saveCurrentChatId(newChatId);
      setMessages([]); // Clear messages for the new chat
      console.log("[handleNewChat] Finished. Set currentId and cleared messages.");

    } catch (error) {
        console.error("[handleNewChat] Error during chat creation:", error);
        // Optionally show a toast error to the user
        toast.error("Chat Creation Error", { description: "Could not create a new chat." });
    } finally {
      // Release the lock
      isCreatingChatRef.current = false;
    }
  }, [chats, setMessages]);

  // Delete a chat
  const handleDeleteChat = useCallback((chatIdToDelete: string) => {
    if (!chatIdToDelete) return;

    // Remove messages from local storage using the new utility function
    deleteChatMessages(chatIdToDelete);

    // Remove chat from the list
    const updatedChats = chats.filter(chat => chat.id !== chatIdToDelete);
    setChats(updatedChats);
    saveChats(updatedChats);

    // If the deleted chat was the current one, select the next available or null
    if (currentChatId === chatIdToDelete) {
        const nextChatId = updatedChats[0]?.id ?? null;
        setCurrentChatId(nextChatId);
        saveCurrentChatId(nextChatId);
        setMessages(nextChatId ? loadMessages(nextChatId) : []); // Load messages for next chat or clear
    }

  }, [currentChatId, chats, setMessages]);

  // Rename a chat
  const handleRenameChat = useCallback((chatIdToRename: string, newTitle: string) => {
      setChats(prevChats => {
          const updatedChats = prevChats.map(chat =>
              chat.id === chatIdToRename ? { ...chat, title: newTitle, lastUpdated: Date.now() } : chat
          );
          saveChats(updatedChats); // Pass toast
          return updatedChats;
      });
  }, []); // No dependencies needed as it only uses setter

  // --- NEW: Handler to toggle pin state ---
  const handleTogglePinChat = useCallback((chatIdToToggle: string) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat.id === chatIdToToggle ? { ...chat, isPinned: !chat.isPinned } : chat
      );
      saveChats(updatedChats);
      return updatedChats;
    });
  }, []);

  // --- NEW: Handler to toggle archive state ---
  const handleToggleArchiveChat = useCallback((chatIdToToggle: string) => {
    setChats(prevChats => {
      // If archiving the current chat, select the next available non-archived chat
      if (currentChatId === chatIdToToggle) {
          const nonArchivedChats = prevChats.filter(c => c.id !== chatIdToToggle && !c.isArchived);
          const nextChatId = nonArchivedChats[0]?.id ?? null;
          setCurrentChatId(nextChatId);
          saveCurrentChatId(nextChatId);
          setMessages(nextChatId ? loadMessages(nextChatId) : []);
      }

      // Update the archive status and save
      const updatedChats = prevChats.map(chat =>
        chat.id === chatIdToToggle ? { ...chat, isArchived: !chat.isArchived, lastUpdated: Date.now() } : chat // Also update timestamp on archive/unarchive
      );
      saveChats(updatedChats);
      return updatedChats;
    });
  }, [currentChatId, setMessages]); // Added currentChatId and setMessages dependency

  // --- NEW: Handler to run Python code via worker ---
  const handleRunPython = useCallback((code: string, messageId: string) => {
    if (!pyodideWorkerRef.current) {
      toast.error("Python Error", { description: "Python environment worker is not available." });
      return;
    }
    if (pyodideStatus !== 'ready') {
      toast.warning("Python Not Ready", { description: `Python environment status: ${pyodideStatus}. Please wait.` });
      return;
    }

    console.log(`[Pyodide] Requesting execution for message ${messageId}`);
    toast.info("Running Python code...");

    // Reset results for this message ID and set status to queued/executing
    setPyExecutionResults(prev => ({
      ...prev,
      [messageId]: { status: 'queued', output: [], error: null }
    }));

    // Send code to worker
    // TODO: Modify worker to accept and return messageId with its messages
    pyodideWorkerRef.current.postMessage({ code: code, messageId: messageId }); // Pass messageId

  }, [pyodideStatus]); // Dependency on pyodideStatus

  // --- Modified handleSend to use attachedFiles state ---
  const handleSend = async (
    event?: React.FormEvent<HTMLFormElement> | { preventDefault?: () => void }
    // Files are no longer passed directly, accessed from state
  ) => {
    if (event && typeof event === 'object' && 'preventDefault' in event) {
        event.preventDefault?.();
    }

    if (isLoading) return; // Prevent sending while loading

    // Sanitize input to prevent potential injection issues
    const textInput = input.trim();

    // --- Process Attached Files ---
    const filesToProcess = attachedFiles; // Get files from state
    const fileContentPromises: Promise<string>[] = [];
    const fileMetadata: { name: string; type: string; size: number }[] = [];
    let fileContentForPrompt = '';

    if (filesToProcess && filesToProcess.length > 0) {
      console.log("Processing files in page.tsx (lifted state):", filesToProcess);
      filesToProcess.forEach(({ file }) => { // Destructure to get the file
        fileMetadata.push({ name: file.name, type: file.type, size: file.size });
        // If it's a text file, create a promise to read its content
        if (ALLOWED_TEXT_MIME_TYPES.includes(file.type)) {
          fileContentPromises.push(
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target?.result as string;
                // Format content for prompt clarity
                resolve(`\n\n--- START FILE: ${file.name} ---\n${text}\n--- END FILE: ${file.name} ---`);
              };
              reader.onerror = (e) => {
                console.error("Error reading file:", file.name, e);
                toast.error("File Read Error", { description: `Could not read file: ${file.name}` });
                resolve(`\n\n[Error reading file: ${file.name}]`);
              };
              reader.readAsText(file); // Read as text
            })
          );
        } else {
          // For non-text files, just add a marker
          fileContentForPrompt += `\n\n[Attached non-text file: ${file.name}]`;
        }
      });

      // Wait for all text file reads to complete
      try {
        const allFileContents = await Promise.all(fileContentPromises);
        fileContentForPrompt += allFileContents.join('');
      } catch (error) {
        console.error("Error processing file contents:", error);
        fileContentForPrompt += "\n\n[Error processing some file contents]";
        toast.error("File Processing Error", { description: "An unexpected error occurred while processing files." });
      }
    }

    // Construct the final message content
    const finalContent = textInput + fileContentForPrompt;

    // Don't send if there's no text and no files processed
    if (!finalContent.trim() && fileMetadata.length === 0) {
        return;
    }

    // Stringify metadata for the data field
    const jsonData = fileMetadata.length > 0 ? JSON.stringify({ attachedFileMetadata: fileMetadata }) : undefined;

    // Clear attached files *before* sending (as append is async)
    setAttachedFiles([]);

    // Use append to send the message
    await append({
      role: 'user',
      content: finalContent, // Send combined text and file contents
      data: JSON.stringify({
        ...(jsonData ? JSON.parse(jsonData) : {}), // Keep existing file metadata if present
        agentMode: agentMode // Add the current agent mode
      })
    });

    // Input should clear automatically via useChat hook now
    // console.log("TODO: Manually clear input field state if possible/needed.");
  };

  // --- Attach Files ---
  const handleAttachFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFileState[] = [];
    // Use const for fileContentPromises as it's not reassigned
    const fileContentPromises: Promise<void>[] = [];

    Array.from(files).forEach(file => {
      let previewUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      const newState: AttachedFileState = { file, previewUrl, error: null };
      newFiles.push(newState);

      // If it's a text file, read its content and append a message
      if (ALLOWED_TEXT_MIME_TYPES.includes(file.type)) {
        fileContentPromises.push(
          file.text()
            .then(text => {
              const userMessage: Message = {
                id: nanoid(),
                role: 'user',
                content: `Attached file: ${file.name}\n\n\`\`\`\n${text}\n\`\`\``,
                // Add data marker to distinguish from regular messages
                data: { type: 'userAction', action: 'fileAttach', filename: file.name }
              };
              // Directly append here, message saving handled by effect
              append(userMessage, { data: { agentMode } });
            })
            .catch(err => {
              console.error(`Error reading file ${file.name}:`, err);
              toast.error("File Read Error", { description: `Could not read file: ${file.name}` });
            })
        );
      }
    });

    // Update state after creating previews
    setAttachedFiles(prev => [...prev, ...newFiles]);

    // Wait for all text files to be read and appended before potentially clearing input
    // (You might adjust UI based on this completion)
    Promise.all(fileContentPromises).then(() => {
        console.log("Finished processing attached text files.");
        // Optionally clear input or perform other actions here
    });
  };

  // --- Handler for removing an attached file ---
  const handleRemoveAttachedFile = useCallback((indexToRemove: number) => {
    setAttachedFiles(prevFiles => {
      const fileToRemove = prevFiles[indexToRemove];
      // Revoke URL if it exists
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter((_, index) => index !== indexToRemove);
    });
  }, []);

  // --- Initialize Pyodide Worker --- (Runs once on mount)
  useEffect(() => {
    if (!isClient) return; // Only run on client

    console.log('[Pyodide] Initializing worker...');
    setPyodideStatus('loading');
    const worker = new Worker('/pyodide-worker.js');
    pyodideWorkerRef.current = worker;

    const handleWorkerMessage = (event: MessageEvent) => {
      const { type, status, data, error, messageId: workerMessageId } = event.data; // Assume worker includes messageId if relevant
      console.log('[Pyodide Worker Message]', type, event.data);

      switch (type) {
        case 'status':
          setPyodideStatus(status);
          if (status === 'error') {
            console.error('[Pyodide] Worker initialization failed:', error);
            toast.error("Python Env Error", { description: `Failed to load Python environment: ${error}` });
          }
          if (status === 'ready') {
            toast.success("Python environment ready.");
          }
          // If status update relates to a specific execution
          if (workerMessageId && (status === 'executing' || status === 'executed' || status === 'error')) {
            setPyExecutionResults(prev => ({
              ...prev,
              [workerMessageId]: {
                ...prev[workerMessageId] || { output: [], error: null }, // Keep existing output/error
                status: status,
                error: status === 'error' ? error : (prev[workerMessageId]?.error ?? null)
              }
            }));
          }
          break;
        case 'stdout':
        case 'stderr':
          // Find the messageId this output belongs to (worker needs to send it back)
          // For now, assume it relates to the currently executing message (needs improvement)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const targetMessageId = Object.entries(pyExecutionResults).find(([_ /* renamed */, res]) => res.status === 'executing')?.[0];
          if (targetMessageId) {
             setPyExecutionResults(prev => ({
                ...prev,
                [targetMessageId]: {
                  ...prev[targetMessageId],
                  output: type === 'stdout' ? [...prev[targetMessageId].output, ...data] : prev[targetMessageId].output,
                  error: type === 'stderr' ? (prev[targetMessageId].error ? prev[targetMessageId].error + '\n' : '') + data.join('\n') : prev[targetMessageId].error,
                  // Keep status as executing while output streams
                }
             }));
          } else {
            console.warn('[Pyodide] Received output/error but no message ID link:', data);
          }
          break;
        default:
          console.warn('[Pyodide] Unknown message type from worker:', type);
      }
    };

    worker.addEventListener('message', handleWorkerMessage);

    // Cleanup
    return () => {
      console.log('[Pyodide] Terminating worker.');
      worker.removeEventListener('message', handleWorkerMessage);
      worker.terminate();
      pyodideWorkerRef.current = null;
      setPyodideStatus('idle');
    };
  }, [isClient, pyExecutionResults]); // Added pyExecutionResults

  if (!isClient) {
    // Show skeleton or loading indicator while waiting for client-side mount
    // Wrap skeleton in the final layout structure
    return (
      <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* App Header Skeleton */}
        <div className="p-3 md:p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Skeleton */}
          <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 flex-shrink-0">
            <Skeleton className="h-9 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          {/* Chat Interface Skeleton */}
          <div className="flex-1 overflow-hidden">
            <ChatInterfaceFallback />
          </div>
        </div>
      </div>
    );
  }

  return (
    // Container for Sidebar + Chat Area (now the root of the page component)
    <div className="flex flex-1 h-full overflow-hidden"> {/* Use h-full to fill parent <main> */}
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* --- Main Chat Area Wrapper --- */}
      <div className="flex flex-1 flex-col overflow-hidden"> {/* Removed top padding */}
        {currentChatId ? (
          <ChatInterface
            currentChatId={currentChatId}
            agentMode={agentMode}
            setAgentMode={setAgentMode}
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSend}
            isLoading={isLoading}
            stop={stop}
            append={append}
            onClear={() => handleDeleteChat(currentChatId)}
            onNewChat={handleNewChat}
            attachedFiles={attachedFiles}
            onAttachFiles={handleAttachFiles}
            onRemoveFile={handleRemoveAttachedFile}
            onRunPython={handleRunPython}
            pyExecutionResults={pyExecutionResults}
          />
        ) : (
          // --- Centered Placeholder for No Chat Selected ---
          <div className="flex flex-1 items-center justify-center text-center bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 p-4">
            <div className="flex flex-col items-center">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a chat or start a new one</p>
                <p className="text-sm">Your conversations will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 