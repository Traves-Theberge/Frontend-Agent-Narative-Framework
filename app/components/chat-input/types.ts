import React from 'react'; // Needed for React.ElementType

// Interface for attached file state
export interface AttachedFileState {
  file: File;
  previewUrl: string | null;
}

// Command definition
export interface CommandItemDef {
  value: string; 
  label: string;
  description: string;
  icon: React.ElementType; // Lucide icon component
  action?: () => void;
}

// Mock User Data structure
export interface MockUser {
  id: string;
  name: string;
  // Add avatar URL if needed
} 