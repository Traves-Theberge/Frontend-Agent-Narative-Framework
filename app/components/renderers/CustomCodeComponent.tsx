'use client'; // Mark as client component since it uses hooks

import React, { memo, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
// Use the direct import paths that worked previously or try CJS again if needed
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus';
import oneLight from 'react-syntax-highlighter/dist/cjs/styles/prism/one-light';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlayIcon, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface CustomComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any; // Explicit any
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Explicit any for rest props
}

interface MarkdownRendererProps {
  content: string;
  messageId: string;
  onRunPython?: (code: string, messageId: string) => void;
}

// The actual component logic, now in its own file
// It receives the combined standard markdown props and our custom ones
const CustomCodeComponent = memo((
    { className, children, messageId, onRunPython, ...props }: CustomComponentProps & { messageId: string; onRunPython?: MarkdownRendererProps['onRunPython'] }
) => {
    const { theme } = useTheme(); 
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1];
    const codeContent = String(children).replace(/\n$/, '');

    // --- Regular Code Block Handling ---
    const isBlock = !className?.includes('inline') && language;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
            setIsCopied(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            toast.error("Failed to copy code.");
        });
    };

    // Choose syntax highlighting style based on theme using directly imported styles
    const syntaxStyle = theme === 'dark' || theme === 'system' ? vscDarkPlus : oneLight;

    if (isBlock) {
        const isPython = language === 'python';
        return (
            <div className="code-block-wrapper relative group my-2 text-sm">
                 {/* Header for language and copy button */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 rounded-t-md">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{language || 'code'}</span>
                    <div className="flex items-center gap-1">
                        {isPython && onRunPython && (
                           <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-foreground"
                                onClick={() => onRunPython(codeContent, messageId)} 
                                title="Run Python code"
                            >
                                <PlayIcon className="h-3.5 w-3.5" />
                            </Button>
                        )}
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-foreground"
                            onClick={handleCopy}
                            title="Copy code"
                        >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>
                 {/* Syntax Highlighter with theme and style */}
                <SyntaxHighlighter
                    language={language}
                    style={syntaxStyle} 
                    customStyle={{
                        background: 'transparent',
                        padding: '1rem',
                        margin: 0,
                        borderRadius: '0 0 0.375rem 0.375rem'
                    }}
                    wrapLongLines={true}
                    className="!bg-slate-50 dark:!bg-slate-900/70 rounded-b-md overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                    PreTag="div"
                    {...props}
                >
                    {codeContent}
                </SyntaxHighlighter>
            </div>
        );
    } else {
        // --- Inline Code Handling ---
        return (
            <code
                className={cn("text-sm px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-foreground", className)}
                {...props}
            >
                {children}
            </code>
        );
    }
});

CustomCodeComponent.displayName = 'CustomCodeComponent';

// Default export is required for next/dynamic
export default CustomCodeComponent; 