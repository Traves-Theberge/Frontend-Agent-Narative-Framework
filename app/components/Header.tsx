'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800">
      <h1 className="text-xl md:text-2xl font-bold">AI Agent Chat</h1>
      <ThemeToggle />
    </header>
  );
}
