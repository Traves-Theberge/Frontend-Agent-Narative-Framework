import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bot, BrainCircuit, Globe } from "lucide-react";

interface AgentModeToggleProps {
  agentMode: 'normal' | 'think' | 'research';
  setAgentMode: React.Dispatch<React.SetStateAction<'normal' | 'think' | 'research'>>;
  isLoading: boolean;
}

export function AgentModeToggle({ agentMode, setAgentMode, isLoading }: AgentModeToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      variant="outline" 
      size="sm"
      value={agentMode}
      onValueChange={(value: 'normal' | 'think' | 'research') => {
        if (value) setAgentMode(value); // value can be empty string if deselected, handle that
        else setAgentMode('normal'); // Default back to normal if somehow deselected
      }}
      aria-label="Agent Mode"
      className="flex-shrink-0 h-10 rounded-lg border bg-transparent p-0.5 gap-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      disabled={isLoading}
    >
      <ToggleGroupItem value="normal" aria-label="Normal Mode" title="Normal Mode" className="h-full px-2 data-[state=on]:bg-neutral-100 dark:data-[state=on]:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400 data-[state=on]:text-neutral-900 dark:data-[state=on]:text-neutral-100 transition-colors duration-150">
        <Bot size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="think" aria-label="Think Mode" title="Think Mode (Detailed)" className="h-full px-2 data-[state=on]:bg-indigo-100 dark:data-[state=on]:bg-indigo-900/50 rounded-md text-neutral-600 dark:text-neutral-400 data-[state=on]:text-indigo-700 dark:data-[state=on]:text-indigo-300 transition-colors duration-150">
        <BrainCircuit size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="research" aria-label="Research Mode" title="Research Mode (Web Search)" className="h-full px-2 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50 rounded-md text-neutral-600 dark:text-neutral-400 data-[state=on]:text-green-700 dark:data-[state=on]:text-green-300 transition-colors duration-150">
        <Globe size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 