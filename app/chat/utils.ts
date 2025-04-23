// Shared utilities for chat

// Remove unused import
// import type { WorkflowToolInvocationResult, WorkflowToolInvocation } from './types'; 

// Remove unused function safeStringify
/*
export function safeStringify(data: unknown): string {
  if (data === null || data === undefined) {
    return '[No Result Data]';
  }
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error stringifying tool result:", error);
    return '[Error Displaying Result]';
  }
}
*/

// Remove unused function isWorkflowData
/*
export function isWorkflowData(data: unknown): data is WorkflowToolInvocationResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as WorkflowToolInvocationResult).workflowStep === 'string' &&
    ['confirmDate', 'selectFlight', 'confirmation'].includes(
      (data as WorkflowToolInvocationResult).workflowStep
    )
  );
}
*/

// Remove unused function isWorkflowToolInvocation
/*
export function isWorkflowToolInvocation(
  invocation: unknown
): invocation is WorkflowToolInvocation {
  return (
    typeof invocation === 'object' &&
    invocation !== null &&
    (invocation as WorkflowToolInvocation).state === 'result' &&
    isWorkflowData((invocation as WorkflowToolInvocation).result)
  );
}
*/

// Keep any other functions in this file if they exist
// ... existing code ...
