import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Toaster as SonnerToaster } from "sonner"

export const metadata: Metadata = {
  title: "AI Agent Framework Assistant",
  description: "AI assistant based on the Agent Narrative Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body className={cn(
        "h-full min-h-screen font-sans antialiased flex flex-col",
        "bg-white dark:bg-black"
      )}>
        <Providers>
          <div className="flex flex-col h-full">
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
          <SonnerToaster richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
