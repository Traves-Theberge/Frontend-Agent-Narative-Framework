import React, { memo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
// import { useTheme } from 'next-themes'; // Removed useTheme as styles are removed
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlayIcon, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
// Removed unused imports for CodeBlock, FlightBookingCard, UserActionCard

// Interfaces
interface CustomComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
interface MarkdownRendererProps {
  content: string;
  messageId: string;
  onRunPython?: (code: string, messageId: string) => void;
}

// Re-integrated CustomCodeComponent logic
const CustomCodeComponent = memo((
    { className, children, messageId, onRunPython, ...props }: CustomComponentProps & { messageId: string; onRunPython?: MarkdownRendererProps['onRunPython'] }
) => {
    // Removed theme logic: const { theme } = useTheme(); 
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1];
    const codeContent = String(children).replace(/\n$/, '');

    const isBlock = !className?.includes('inline') && language;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
            setIsCopied(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000); 
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            toast.error("Failed to copy code.");
        });
    };

    // Removed style selection: const syntaxStyle = theme === 'dark' || theme === 'system' ? vscDarkPlus : oneLight;

    if (isBlock) {
        const isPython = language === 'python';
        return (
            <div className="code-block-wrapper relative group my-2 text-sm">
                 <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 rounded-t-md">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{language || 'code'}</span>
                    <div className="flex items-center gap-1">
                        {isPython && onRunPython && (
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-foreground" onClick={() => onRunPython(codeContent, messageId)} title="Run Python code">
                                <PlayIcon className="h-3.5 w-3.5" />
                            </Button>
                        )}
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-foreground" onClick={handleCopy} title="Copy code">
                            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>
                 <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        background: 'transparent',
                        padding: '1rem',
                        margin: 0,
                        borderRadius: '0 0 0.375rem 0.375rem'
                    }}
                    className="!bg-slate-50 dark:!bg-slate-900/70 rounded-b-md overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent whitespace-pre-wrap break-words"
                    PreTag="div"
                    {...props}
                >
                    {codeContent}
                </SyntaxHighlighter>
            </div>
        );
    } else {
        // Inline Code Handling
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

// Main component uses the re-integrated code component
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  messageId,
  onRunPython,
}: MarkdownRendererProps) {
  if (typeof content !== 'string') {
    console.error("MarkdownRenderer received non-string content:", content);
    return null;
  }

  const components: Components = {
    // Define inline to match ReactMarkdown expected props, but don't destructure node
    code: ({ className, children, ...props }) => {
      // Check if node exists in props if needed for specific logic, otherwise ignore
      const codeProps = {
        className,
        children,
        messageId, // Pass messageId explicitly
        onRunPython, // Pass onRunPython explicitly
        ...props 
      };
      return <CustomCodeComponent {...codeProps} />;
    },
  };

  return (
    <div className="prose prose-sm dark:prose-invert prose-slate max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
    </div>
  );
}); 
MarkdownRenderer.displayName = 'MarkdownRenderer'; 