import type { Message } from 'ai/react';
import { toast } from 'sonner';
import { isUserActionData } from '../chat/types'; // Adjust path if necessary

// --- Chat History Item Type (Moved from page.tsx) ---
export interface ChatHistoryItem {
  id: string;
  title: string;
  lastUpdated: number; // Timestamp (e.g., Date.now())
  isPinned: boolean;
  isArchived: boolean;
}

// Keys for localStorage
const CHATS_STORAGE_KEY = 'chat-list';
const MESSAGES_STORAGE_PREFIX = 'chat-messages-';
const CURRENT_CHAT_ID_KEY = 'current-chat-id';

// --- localStorage Helpers (Moved from page.tsx) ---

export function loadChats(): ChatHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    const parsedChats = storedChats ? JSON.parse(storedChats) : [];
    // --- Add default values for migration ---
    return parsedChats.map((chat: Partial<ChatHistoryItem> & { id: string; title: string }) => ({
      id: chat.id,
      title: chat.title,
      lastUpdated: chat.lastUpdated || Date.now(),
      isPinned: chat.isPinned || false,
      isArchived: chat.isArchived || false,
    }));
  } catch (error) {
    console.error("Error loading chat list:", error);
    toast.error("Load Error", { description: "Could not load chat list from local storage." });
    return [];
  }
}

export function saveChats(chats: ChatHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving chat list:", error);
    toast.error("Save Error", { description: "Could not save chat list to local storage." });
  }
}

export function loadMessages(chatId: string): Message[] {
  if (typeof window === 'undefined' || !chatId) return []; // Add !chatId check
  try {
    const storedMessages = localStorage.getItem(`${MESSAGES_STORAGE_PREFIX}${chatId}`);
    return storedMessages ? JSON.parse(storedMessages) : [];
  } catch (error) {
    console.error(`Error loading messages for chat ${chatId}:`, error);
    toast.error("Load Error", { description: `Could not load messages for chat ${chatId.substring(0, 4)}...` });
    return [];
  }
}

export function saveMessages(chatId: string, messages: Message[]): void {
  if (typeof window === 'undefined' || !chatId) return;
  try {
    // Filter out user actions before saving
    const messagesToSave = messages.filter(m =>
      !(m.role === 'user' && isUserActionData(m.data))
    );
    localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${chatId}`, JSON.stringify(messagesToSave));
  } catch (error) {
    console.error(`Error saving messages for chat ${chatId}:`, error);
    toast.error("Save Error", { description: `Could not save messages for chat ${chatId.substring(0, 4)}...` });
  }
}

export function saveCurrentChatId(chatId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (chatId) {
      localStorage.setItem(CURRENT_CHAT_ID_KEY, chatId);
    } else {
      localStorage.removeItem(CURRENT_CHAT_ID_KEY);
    }
  } catch (error) {
    console.error("Error saving current chat ID:", error);
    toast.error("Error", { description: "Could not save current chat session state." });
  }
}

export function loadCurrentChatId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CURRENT_CHAT_ID_KEY);
  } catch (error) {
    console.error("Error loading current chat ID:", error);
    toast.error("Load Error", { description: "Could not load current chat session state." });
    return null;
  }
}

export function deleteChatMessages(chatId: string): void {
    if (typeof window === 'undefined' || !chatId) return;
    try {
        localStorage.removeItem(`${MESSAGES_STORAGE_PREFIX}${chatId}`);
    } catch (error) {
        console.error(`Error deleting messages for chat ${chatId}:`, error);
        toast.error("Deletion Error", { description: `Could not delete messages for chat ${chatId.substring(0, 4)}...` });
    }
} 