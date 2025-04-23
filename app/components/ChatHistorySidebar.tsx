'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from "@/components/ui/input";
import {
  PlusCircle, MessageSquare, Trash2, Pencil, PanelLeftClose, PanelLeftOpen, Search, Pin, PinOff,
  ArrowDownUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Import Context Menu components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; // Import Label

interface ChatHistoryItem {
  id: string;
  title: string;
  lastUpdated: number;
  isPinned: boolean;
  isArchived: boolean; 
}

interface ChatHistorySidebarProps {
  chats: ChatHistoryItem[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onTogglePinChat: (chatId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
      return `${diffDays}d ago`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
  }
}

// Define Sort Criteria Type
type SortCriteria = 'lastUpdated' | 'title';

const MAX_CHATS_DISPLAYED = 10; // Define chat limit
const RENAME_INPUT_MAX_LENGTH = 15; // New constant for rename limit

export function ChatHistorySidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  isCollapsed,
  onToggleCollapse,
}: ChatHistorySidebarProps) {

  const [searchTerm, setSearchTerm] = useState('');
  // --- Add state for sort criteria ---
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('lastUpdated');

  // --- State for Dialogs ---
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameChatTitle, setRenameChatTitle] = useState('');
  const [newTitleInput, setNewTitleInput] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const chatToDelete = useMemo(() => chats.find(c => c.id === deleteChatId), [chats, deleteChatId]);

  // Effect to update input when dialog opens
  useEffect(() => {
    if (isRenameDialogOpen && renameChatTitle) {
      setNewTitleInput(renameChatTitle);
    } else {
      setNewTitleInput(''); // Clear input when closing
    }
  }, [isRenameDialogOpen, renameChatTitle]);

  const handleTogglePin = (chatId: string) => {
    console.log(`[ChatHistorySidebar] Attempting to toggle pin for chat ID: ${chatId}`);
    onTogglePinChat(chatId);
  };

  // --- Update Sorting Logic based on sortCriteria state ---
  const sortedChats = useMemo(() => {
    const filtered = chats.filter(chat =>
      !chat.isArchived &&
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortFunction = (a: ChatHistoryItem, b: ChatHistoryItem) => {
      if (sortCriteria === 'lastUpdated') {
        return b.lastUpdated - a.lastUpdated; // Descending (newest first)
      } else if (sortCriteria === 'title') {
        return a.title.localeCompare(b.title); // Ascending (A-Z)
      }
      return 0;
    };

    const pinned = filtered.filter(chat => chat.isPinned).sort(sortFunction);
    const unpinned = filtered.filter(chat => !chat.isPinned).sort(sortFunction);
                           
    return [...pinned, ...unpinned].slice(0, MAX_CHATS_DISPLAYED);
  }, [chats, searchTerm, sortCriteria]); // Add sortCriteria dependency

  // --- Updated Handlers to use Dialogs ---
  const openRenameDialog = (chatId: string, currentTitle: string) => {
    setRenameChatId(chatId);
    setRenameChatTitle(currentTitle);
    // setNewTitleInput(currentTitle); // Set input in useEffect
    setIsRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (renameChatId && newTitleInput && newTitleInput.trim() !== renameChatTitle) {
      console.log(`[ChatHistorySidebar] Attempting to rename chat ID: ${renameChatId} to "${newTitleInput.trim()}"`);
      onRenameChat(renameChatId, newTitleInput.trim());
    }
    setIsRenameDialogOpen(false); // Close dialog
    setRenameChatId(null);
    setRenameChatTitle('');
  };

  const openDeleteDialog = (chatId: string) => {
    setDeleteChatId(chatId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteChatId) {
      console.log(`[ChatHistorySidebar] Attempting to delete chat ID: ${deleteChatId}`);
      onDeleteChat(deleteChatId);
    }
    setIsDeleteDialogOpen(false); // Close dialog
    setDeleteChatId(null);
  };

  // Click handlers for hover buttons now open dialogs
  // Remove unused handlePinClick
  // const handlePinClick = (event: React.MouseEvent, chatId: string) => {
  //   event.stopPropagation();
  //   handleTogglePin(chatId);
  // };
   const handleRenameClick = (event: React.MouseEvent, chatId: string, currentTitle: string) => {
    event.stopPropagation();
    openRenameDialog(chatId, currentTitle); // Open rename dialog
  };
   const handleDeleteClick = (event: React.MouseEvent, chatId: string) => {
    event.stopPropagation();
    openDeleteDialog(chatId); // Open delete dialog
  };

  return (
    <>
      <div className={cn(
        "flex flex-col h-full bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border-r border-neutral-200 dark:border-neutral-800 transition-[width] duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-14" : "w-64"
        )}>
        {/* Header Section - Apply padding here */}
        <div className={cn(
            "flex-shrink-0", 
            isCollapsed ? "pt-3 md:pt-4 pb-2 flex justify-center" : "px-3 pt-3 md:pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800"
            )}>
           <TooltipProvider delayDuration={isCollapsed ? 100 : 500}>
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 h-9 text-sm transition-colors duration-150",
                      isCollapsed && "justify-center items-center p-0 w-9 h-9 mx-auto border-dashed hover:border-solid"
                    )}
                    onClick={onNewChat}
                    aria-label={isCollapsed ? "New Chat" : undefined}
                  >
                    <PlusCircle className={cn("flex-shrink-0 text-neutral-500 dark:text-neutral-400", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                    {!isCollapsed && <span className="whitespace-nowrap">New Chat</span>}
                  </Button>
               </TooltipTrigger>
               {isCollapsed && <TooltipContent side="right"><p>New Chat</p></TooltipContent>}
             </Tooltip>
          </TooltipProvider>

          {!isCollapsed && (
            <div className="mt-3 space-y-4">
              {/* Search Input */}
              <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
                  <Input
                      type="text"
                      placeholder="Filter chats..."
                      className="w-full h-9 pl-8 pr-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-indigo-500 rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              {/* Sort Select Dropdown */}
              <Select 
                value={sortCriteria} 
                onValueChange={(value: string) => setSortCriteria(value as SortCriteria)}
              >
                <SelectTrigger className="h-9 w-full text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:ring-1 focus-visible:ring-1 focus:ring-offset-0 focus-visible:ring-offset-0 focus:ring-indigo-500 focus-visible:ring-indigo-500 text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownUp className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">Sort by: <SelectValue placeholder="Select sort..." /></span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* History List */}
        <ScrollArea className={cn("flex-1", isCollapsed ? "px-2 py-2" : "px-2 py-2")}> 
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {sortedChats.map((chat) => (
              <ContextMenu key={chat.id}>
                <TooltipProvider delayDuration={isCollapsed ? 100 : 500}>
                  <Tooltip>
                      <ContextMenuTrigger asChild>
                        <div
                          className={cn(
                            "relative flex items-center w-full p-2 rounded-md text-sm font-medium cursor-pointer",
                            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            currentChatId === chat.id
                              ? "bg-neutral-200/60 dark:bg-neutral-800/80"
                              : "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            isCollapsed && "justify-center items-center p-0 w-9 h-9 mx-auto min-h-0 pr-0"
                          )}
                          onClick={() => !isCollapsed && onSelectChat(chat.id)}
                          onContextMenu={(e) => isCollapsed && e.preventDefault()}
                          title={isCollapsed ? chat.title : undefined}
                          aria-label={isCollapsed ? chat.title : undefined}
                        >
                          {currentChatId === chat.id && !isCollapsed &&
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4/6 w-[3px] bg-indigo-500 rounded-r-full"></div>
                          }
                          <MessageSquare className={cn("h-4 w-4 flex-shrink-0 text-neutral-500 dark:text-neutral-400", !isCollapsed && "mr-2")} />
                          {!isCollapsed && (
                            <div className="flex flex-col flex-grow overflow-hidden min-w-0 mr-1">
                              <span className="truncate whitespace-nowrap overflow-hidden font-medium text-neutral-800 dark:text-neutral-200">
                                { (chat.title || `Chat ${chat.id.substring(0, 4)}...`) }
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {formatTimestamp(chat.lastUpdated)}
                              </span>
                            </div>
                          )}
                          {!isCollapsed && (
                            <div className="flex items-center flex-shrink-0 space-x-0.5 ml-1">
                                {/* Pin/Unpin Button (No Tooltip) */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 text-neutral-500 dark:text-neutral-400",
                                    chat.isPinned
                                      ? "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                      : "hover:text-neutral-700 dark:hover:text-neutral-200"
                                  )}
                                  onClick={(e) => { e.stopPropagation(); handleTogglePin(chat.id); }}
                                  aria-label={chat.isPinned ? "Unpin chat" : "Pin chat"} // Use aria-label for accessibility
                                  title={chat.isPinned ? "Unpin chat" : "Pin chat"} // Keep title for basic hover
                                >
                                  {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                                </Button>
                                {/* Rename Button (No Tooltip) */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-neutral-500 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400"
                                  onClick={(e) => { e.stopPropagation(); openRenameDialog(chat.id, chat.title); }}
                                  aria-label={`Rename chat "${chat.title}"`}
                                  title={`Edit title for "${chat.title}"`}
                                >
                                  <Pencil size={14} />
                                </Button>
                                {/* Delete Button (No Tooltip) */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                                  onClick={(e) => { e.stopPropagation(); openDeleteDialog(chat.id); }}
                                  aria-label={`Delete chat "${chat.title}"`}
                                  title={`Delete "${chat.title}"`}
                                >
                                  <Trash2 size={14} />
                                </Button>
                            </div>
                          )}
                        </div>
                      </ContextMenuTrigger>
                      {isCollapsed && <TooltipContent side="right"><p>{chat.title || `Chat ${chat.id.substring(0, 4)}...`}</p></TooltipContent>}
                  </Tooltip>
                </TooltipProvider>

                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => handleTogglePin(chat.id)} className="cursor-pointer">
                    {chat.isPinned ? (
                        <><PinOff className="mr-2 h-4 w-4" /><span>Unpin</span></>
                    ) : (
                        <><Pin className="mr-2 h-4 w-4" /><span>Pin to top</span></>
                    )}
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => openRenameDialog(chat.id, chat.title)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => openDeleteDialog(chat.id)}
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-900/20 dark:focus:text-red-400"
                   >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            {chats.length > 0 && sortedChats.length === 0 && !isCollapsed && (
                <div className="flex flex-col items-center justify-center text-center pt-10 px-4">
                  <Search className="h-10 w-10 text-neutral-400 dark:text-neutral-600 mb-3" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    No Matching Chats
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    No chats found for &quot;<span className='font-medium'>{searchTerm}</span>&quot;.
                  </p>
                </div>
            )}
            {chats.length === 0 && !isCollapsed && (
              <div className="flex flex-col items-center justify-center text-center pt-10 px-4">
                <MessageSquare className="h-10 w-10 text-neutral-400 dark:text-neutral-600 mb-3" />
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  No Chats Yet
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Click &quot;New Chat&quot; to start a conversation.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Adjust button size for consistency */} 
        <div className={cn("flex-shrink-0 mt-auto flex justify-center", isCollapsed ? "py-2" : "p-2 border-t border-neutral-200 dark:border-neutral-800")}> 
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mx-auto text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  onClick={onToggleCollapse}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"} align="center"><p>{isCollapsed ? "Expand" : "Collapse"}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* --- Rename Dialog --- */ }
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title (max {RENAME_INPUT_MAX_LENGTH} characters) for the chat "{renameChatTitle}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                New Title
              </Label>
              <Input 
                id="name" 
                value={newTitleInput} 
                onChange={(e) => setNewTitleInput(e.target.value)}
                className="col-span-3" 
                placeholder="Enter new title..."
                maxLength={RENAME_INPUT_MAX_LENGTH}
                onKeyDown={(e) => e.key === 'Enter' && confirmRename()} // Submit on Enter
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={confirmRename} 
              disabled={!newTitleInput.trim() || newTitleInput === renameChatTitle} // Disable if empty or unchanged
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete Dialog --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chat &quot;{chatToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4"> {/* Added margin top */} 
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button 
                type="button" 
                variant="destructive" 
                onClick={confirmDelete}
            >
              Delete Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}