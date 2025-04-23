import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { formatFileSize, getFileIconComponent } from './utils'; // Import utilities
import { AttachedFileState } from './types'; // Import shared type

interface AttachedFilesPreviewProps {
  attachedFiles: AttachedFileState[];
  onRemoveFile: (index: number) => void;
}

export function AttachedFilesPreview({ attachedFiles, onRemoveFile }: AttachedFilesPreviewProps) {
  if (attachedFiles.length === 0) {
    return null; // Don't render anything if no files
  }

  return (
    <div className="px-3 pt-2 md:px-4 md:pt-2">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5 font-medium">Attached Files:</p>
      <div className="flex flex-wrap gap-2 pb-2">
        {attachedFiles.map((item, index) => (
          <div 
            key={index} 
            className="relative group flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs overflow-hidden shadow-sm"
          >
            {item.previewUrl ? (
              <Image 
                src={item.previewUrl} 
                alt={`Preview of ${item.file.name}`} 
                width={24} 
                height={24} 
                className="object-cover rounded-sm flex-shrink-0"
              />
            ) : (
              React.createElement(getFileIconComponent(item.file), { // Use helper function from utils
                className: "h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0"
              })
            )}
            <div className="flex flex-col overflow-hidden">
                <span className="text-neutral-700 dark:text-neutral-200 truncate font-medium">{item.file.name}</span>
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{formatFileSize(item.file.size)}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="ml-1 p-0.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 opacity-70 group-hover:opacity-100 transition-all"
              aria-label={`Remove ${item.file.name}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 