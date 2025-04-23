"use client";
import React from 'react';
import { type Message, type UseChatHelpers } from 'ai/react';
import { MessageBubble } from './MessageBubble';
import type { AppMessage, ContentType } from '../../lib/types';
import { DateConfirmationComponent } from './workflows/date-confirmation';
import { FlightOptionsComponent } from './workflows/flight-options';
import { BookingConfirmationComponent } from './workflows/booking-confirmation';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, AlertCircle, Check, Loader, Clock } from 'lucide-react';
import type { 
  ConfirmDateResult, 
  SelectFlightResult, 
  ConfirmationResult 
} from '@/chat/types';

// Re-add PyExecutionResult definition (or import if shared)
interface PyExecutionResult {
  status: 'idle' | 'loading' | 'queued' | 'executing' | 'executed' | 'error';
  output: string[];
  error: string | null;
}

interface MessageItemProps {
  message: Message;
  append: UseChatHelpers['append'];
  onRunPython?: (code: string, messageId: string) => void;
  // Add the results prop
  pyExecutionResults?: Record<string, PyExecutionResult>;
}

// Helper function to convert Message content to AppMessage ContentType
function parseContent(content: string): ContentType {
  // Simple implementation: assume all content is text for now.
  // Future: Could add logic here to detect HTML/SVG/Mermaid/Python
  // if the AI starts sending structured content outside tool calls.
  return { type: 'text', text: content };
}

// Basic wrapper for consistent workflow component styling
function WorkflowWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-10 md:ml-11 my-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 shadow-sm">
      {children}
    </div>
  );
}

// --- Specific Prop Interfaces for Internal Step Components ---

interface ConfirmDateStepProps {
  key: string; 
  workflowData: ConfirmDateResult; // Use specific type
  toolCallId: string;
  append: UseChatHelpers['append'];
}

interface SelectFlightStepProps {
  key: string; 
  workflowData: SelectFlightResult; // Use specific type
  toolCallId: string;
  append: UseChatHelpers['append'];
}

interface ConfirmationStepProps {
   key: string;
   workflowData: ConfirmationResult; // Use specific type
}

// --- Internal Step Components using Specific Props ---

function ConfirmDateStep({ key, workflowData, toolCallId, append }: ConfirmDateStepProps) {
  // Now workflowData is known to be ConfirmDateResult
  return (
    <WorkflowWrapper key={key}>
      <DateConfirmationComponent
        departureCity={workflowData.departureCity} // No need for ??
        arrivalCity={workflowData.arrivalCity}     // No need for ??
        targetDateString={workflowData.targetDateString} // No need for ??
        toolCallId={toolCallId}
        append={append}
      />
    </WorkflowWrapper>
  );
}
ConfirmDateStep.displayName = 'ConfirmDateStep';

function SelectFlightStep({ key, workflowData, toolCallId, append }: SelectFlightStepProps) {
  // Now workflowData is known to be SelectFlightResult
  return (
    <WorkflowWrapper key={key}>
      <FlightOptionsComponent
        availableFlights={workflowData.availableFlights} // No need for ??
        departureCity={workflowData.departureCity}      // No need for ??
        arrivalCity={workflowData.arrivalCity}        // No need for ??
        confirmedDate={workflowData.confirmedDate}      // No need for ??
        toolCallId={toolCallId}
        append={append}
      />
    </WorkflowWrapper>
  );
}
SelectFlightStep.displayName = 'SelectFlightStep';

// ConfirmationStep already had its own props, just ensure type is specific
function ConfirmationStep({ key, workflowData }: ConfirmationStepProps) {
  // Now workflowData is known to be ConfirmationResult
  return (
    <WorkflowWrapper key={key}>
      {/* Check for properties directly */} 
      {workflowData.bookingRef && workflowData.flightDetails ? (
        <BookingConfirmationComponent
          bookingRef={workflowData.bookingRef} // No need for ??
          flightDetails={workflowData.flightDetails} // No need for ??
        />
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error displaying confirmation details.
        </p>
      )}
    </WorkflowWrapper>
  );
}
ConfirmationStep.displayName = 'ConfirmationStep';

function UnknownStep({ key }: { key: string }) {
    return (
        <WorkflowWrapper key={key}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unknown workflow step received.
            </p>
        </WorkflowWrapper>
    );
}
UnknownStep.displayName = 'UnknownStep';

export function MessageItem({ 
  message, 
  append, 
  onRunPython, 
  pyExecutionResults 
}: MessageItemProps) {
  // Destructure only used properties
  const { id, role, content, createdAt } = message;
  
  if (role !== 'user' && role !== 'assistant') return null;

  // Create the AppMessage structure required by MessageBubble
  const appMessage: AppMessage = {
    id: id,
    role: role,
    content: parseContent(content), // Keep existing content parsing
    createdAt: createdAt, 
  };

  // Get execution results for this specific message
  const executionResult = pyExecutionResults?.[id];

  // Determine icon based on status
  let StatusIconComponent: React.FC | null = null; // Store the component type
  let statusColor: "destructive" | "default" = "default"; // Initialize with correct type
  let statusTitle = '';

  if (executionResult && executionResult.status !== 'idle') {
    switch (executionResult.status) {
      case 'queued':
        StatusIconComponent = () => <Clock className="h-4 w-4 text-muted-foreground" />;
        StatusIconComponent.displayName = 'StatusIconQueued';
        statusTitle = 'Python: Queued';
        break;
      case 'executing':
        StatusIconComponent = () => <Loader className="h-4 w-4 animate-spin text-blue-500" />;
        StatusIconComponent.displayName = 'StatusIconExecuting';
        statusTitle = 'Python: Executing';
        break;
      case 'executed':
        StatusIconComponent = () => <Check className="h-4 w-4 text-green-500" />;
        StatusIconComponent.displayName = 'StatusIconExecuted';
        statusTitle = 'Python: Executed';
        break;
      case 'error':
        StatusIconComponent = () => <AlertCircle className="h-4 w-4" />;
        StatusIconComponent.displayName = 'StatusIconError';
        statusTitle = 'Python: Error';
        statusColor = 'destructive'; // Set color explicitly for error
        break;
      default:
        StatusIconComponent = () => <Terminal className="h-4 w-4" />;
        StatusIconComponent.displayName = 'StatusIconDefault';
        statusTitle = `Python: ${executionResult.status}`;
        break;
    }
  }

  return (
    <div className="flex items-start gap-3 justify-start group">
      {/* Avatar */}
      {/* ... (Avatar rendering remains the same) ... */}

      <div className="flex flex-col flex-1 space-y-1 min-w-0"> {/* Ensure flex-col and min-w-0 */}
        <MessageBubble message={appMessage} onRunPython={onRunPython}/>

        {/* Render Python Execution Results using Alert */}
        {executionResult && executionResult.status !== 'idle' && (
          <div className="ml-10 md:ml-11 mt-2 mb-2 text-xs">
            <Alert variant={statusColor}>
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 pt-0.5">
                  {StatusIconComponent && <StatusIconComponent />} {/* Render the stored component */}
                </div>
                <div className="flex-grow"> 
                  <AlertTitle className="font-semibold capitalize">
                    {statusTitle}
                  </AlertTitle>
                  {(executionResult.output.length > 0 || executionResult.error) && (
                    <AlertDescription className="mt-1 space-y-2">
                      {executionResult.output.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground">Output:</span>
                          <pre className="mt-1 whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-2 rounded font-mono text-[11px] leading-snug border border-border">
                            {executionResult.output.join('\\n')}
                          </pre>
                        </div>
                      )}
                      {executionResult.error && (
                        <div>
                           <span className="font-medium text-destructive">Error:</span>
                           <pre className="mt-1 whitespace-pre-wrap bg-destructive/10 p-2 rounded font-mono text-[11px] leading-snug border border-destructive/20 text-destructive">
                             {executionResult.error}
                           </pre>
                        </div>
                      )}
                    </AlertDescription>
                  )}
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Refactored logic to use message.parts for tool invocations */}
        {role === 'assistant' && message.parts?.map((part, idx) => {
          // Check if the part is a tool invocation and has a result
          if (part.type === 'tool-invocation' && part.toolInvocation.state === 'result') {
            const { toolCallId, result: workflowData /*, toolName*/ } = part.toolInvocation;
            
            // Ensure workflowData is an object and has workflowStep before proceeding
            if (typeof workflowData === 'object' && workflowData !== null && 'workflowStep' in workflowData && typeof workflowData.workflowStep === 'string') {
                
                const uniqueKey = `${id}-part-${toolCallId}-${idx}`; 
                
                // Cast workflowData initially to access workflowStep safely
                const potentialWorkflowData = workflowData as { workflowStep: string, [key: string]: unknown };

                // Use if/else if with explicit type assertions on the workflowData object
                if (potentialWorkflowData.workflowStep === 'confirmDate') {
                  // Assert workflowData is ConfirmDateResult with fallbacks
                  const confirmedData = workflowData as ConfirmDateResult;
                  return <ConfirmDateStep 
                            key={uniqueKey} 
                            workflowData={confirmedData}
                            toolCallId={toolCallId} 
                            append={append} 
                         />;
                } else if (potentialWorkflowData.workflowStep === 'selectFlight') {
                  // Assert workflowData is SelectFlightResult with fallbacks
                  const flightData = workflowData as SelectFlightResult;
                  return <SelectFlightStep 
                            key={uniqueKey} 
                            workflowData={flightData}
                            toolCallId={toolCallId} 
                            append={append} 
                         />;
                } else if (potentialWorkflowData.workflowStep === 'confirmation') {
                  // Assert workflowData is ConfirmationResult with fallbacks
                  const bookingData = workflowData as ConfirmationResult;
                  // Define the default structure for flightDetails
                  const defaultFlightDetails = { id: '', departureCity: '', arrivalCity: '', confirmedDate: '', price: 0, airline: '' };
                  return <ConfirmationStep 
                            key={uniqueKey} 
                            workflowData={{
                              ...bookingData,
                              bookingRef: bookingData.bookingRef ?? '',
                              // Reinstate nullish coalescing with the default object
                              flightDetails: bookingData.flightDetails ?? defaultFlightDetails
                            }}
                         />;
                } else {
                  // Handle unknown workflow steps if necessary
                  console.warn("Unknown workflow step:", potentialWorkflowData.workflowStep);
                  return <UnknownStep key={uniqueKey} />;
                }
            } else {
                 // Render a placeholder or log if workflowData is not the expected shape
                console.warn("Tool invocation result is not a valid workflow object:", workflowData);
                // Optionally render a generic tool result view
                return null; 
            }

          } else if (part.type === 'tool-invocation' && (part.toolInvocation.state === 'call' || part.toolInvocation.state === 'partial-call')) {
             // Handle 'calling' or 'partial-call' state (e.g., show skeleton)
             const uniqueKey = `${id}-part-${part.toolInvocation.toolCallId}-${idx}`;
             const SkeletonPlaceholder = () => (
                 <div key={uniqueKey} className="ml-10 md:ml-11 mt-1">
                    <Skeleton className="h-4 w-24 bg-slate-300 dark:bg-slate-700" />
                 </div>
             );
             SkeletonPlaceholder.displayName = 'ToolInvocationSkeleton';
             return <SkeletonPlaceholder />;
          }
          // Ignore other part types (like 'text') in this loop
          return null;
        })}
      </div>
    </div>
  );
}

// Memoize MessageItem to prevent unnecessary re-renders if props haven't changed value
export const MemoizedMessageItem = React.memo(MessageItem);
MemoizedMessageItem.displayName = 'MemoizedMessageItem'; // Add display name
