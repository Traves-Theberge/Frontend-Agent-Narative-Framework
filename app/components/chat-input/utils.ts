import React from 'react';
import { 
  FileJson, FileCode2, FileArchive, FileSpreadsheet, FileAudio2, FileVideo2, FileImage, FileText 
} from "lucide-react";

// Max history items to store
export const MAX_INPUT_HISTORY = 50;

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to get file icon component
export function getFileIconComponent(file: File): React.ElementType {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo2;
  if (mimeType.startsWith('audio/')) return FileAudio2;
  
  switch (extension) {
    case 'json': return FileJson;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'go':
    case 'rb':
    case 'php':
    case 'html':
    case 'css':
    case 'scss':
    case 'less':
    case 'md':
    case 'sh':
    case 'yml':
    case 'yaml':
      return FileCode2;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return FileArchive;
    case 'csv':
    case 'xls':
    case 'xlsx':
      return FileSpreadsheet;
    case 'pdf': return FileText; // Or specific PDF icon if needed
    case 'doc':
    case 'docx': return FileText; // Or specific DOC icon
    default: return FileText; // Default fallback icon
  }
}

// --- Draft Saving/Loading Key ---
export const getDraftKey = (chatId: string | null): string | null => chatId ? `chatInputDraft-${chatId}` : null; 