# AI Agent Framework Assistant

This project is an advanced AI assistant built using Next.js and the Vercel AI SDK. It serves as a demonstration of integrating various modern web technologies to create a feature-rich chat interface capable of code generation, execution, and tool usage, guided by the principles of an "Agent Narrative Framework".

## Features

*   **Conversational AI:** Powered by OpenAI's GPT-4o via the Vercel AI SDK for natural language interaction.
*   **Streaming Responses:** Real-time message streaming for a smooth user experience.
*   **Chat History:** Persistent chat history management using Local Storage (pin, rename, delete, archive, search, sort).
*   **File Attachments:** Supports attaching files, including image previews and injecting text content into prompts.
*   **React Artifact Rendering:** Renders AI-generated React components securely within a sandboxed `iframe` for live previews.
*   **Artifact Capture:** Allows capturing a PNG screenshot of the rendered React artifact.
*   **Python Code Execution:** Executes AI-generated Python code using Pyodide within a Web Worker for safe, sandboxed execution. Displays `stdout` and `stderr`.
*   **AI Tool Usage:** Framework for defining and using tools that the AI can leverage (example: flight booking).
*   **Agent Modes:** Different modes ('normal', 'think', 'research') can influence AI behavior (implementation details may vary).
*   **Responsive Design:** Built with Tailwind CSS for responsiveness across devices.
*   **Modern UI:** Utilizes Shadcn UI components for a clean and modern look and feel.
*   **Collapsible Sidebar:** Adjustable chat history sidebar for flexible layout.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) 14+ (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **AI:** [Vercel AI SDK](https://sdk.vercel.ai/), [OpenAI GPT-4o](https://openai.com/gpt-4o/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) (Icons)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
*   **Code Execution:** [Pyodide](https://pyodide.org/en/stable/) (via Web Worker)
*   **Fonts:** [Geist Sans & Mono](https://vercel.com/font)

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (Version recommended by Next.js 14+, e.g., 18.17 or later)
*   [npm](https://www.npmjs.com/) (or yarn/pnpm)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Environment Variables

1.  Create a `.env.local` file in the root of the project.
2.  Add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```
    *Note: Ensure this key has access to the GPT-4o model.*

### Running the Development Server

```bash
npm run dev
# or
# yarn dev
# or
# pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
.
├── app/                  # Next.js App Router directory
│   ├── api/chat/         # API route for handling chat logic
│   │   └── route.ts
│   ├── ai/               # AI-related configurations
│   │   └── tools.ts      # Definition of tools for the AI model
│   ├── chat/             # Types related to chat functionality
│   │   └── types.ts
│   ├── components/       # React components
│   │   ├── renderers/    # Components for rendering specific outputs (Markdown, Artifacts, etc.)
│   │   ├── chat-input/   # Components related to the chat input area
│   │   ├── ui/           # Shadcn UI components (auto-generated)
│   │   ├── ArtifactViewer.tsx
│   │   ├── ChatHistorySidebar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── MessageItem.tsx
│   │   └── MessageList.tsx
│   ├── lib/              # Utility functions and libraries
│   │   ├── storage.ts    # Local Storage management for chat history
│   │   └── utils.ts      # General utility functions (e.g., cn)
│   ├── artifact-renderer/ # Assets for the artifact rendering iframe
│   │   └── ...
│   ├── globals.css       # Global CSS styles
│   ├── layout.tsx        # Root layout component
│   ├── page.tsx          # Main page component (chat interface entry point)
│   └── providers.tsx     # Context providers (Theme, etc.)
├── public/               # Static assets
│   ├── artifact-renderer.html # HTML page loaded in the artifact iframe
│   └── pyodide-worker.js  # Web Worker script for Pyodide
├── .env.local            # Local environment variables (ignored by Git)
├── components.json       # Shadcn UI configuration
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Key Concepts

*   **Artifact Rendering:** AI-generated React code tagged with `` ```artifact ``` `` is rendered in a sandboxed `iframe` (`public/artifact-renderer.html`). Communication happens via `postMessage` to update the code and capture screenshots. This isolates potentially unsafe code from the main application.
*   **Pyodide Integration:** Python code execution requests are sent to a Web Worker (`public/pyodide-worker.js`). The worker initializes Pyodide, runs the code, and sends back `stdout`/`stderr` via `postMessage`. This prevents blocking the main thread and isolates Python execution.
*   **Chat History:** Chat metadata and messages are saved to the browser's Local Storage using utility functions in `app/lib/storage.ts`. This provides persistence within a single browser session.

## Deployment

The easiest way to deploy this Next.js application is to use the [Vercel Platform](https://vercel.com/new).

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Configure the Environment Variable `OPENAI_API_KEY` in the Vercel project settings.
4.  Deploy!

Vercel automatically handles the build process and optimizes the application for production.
