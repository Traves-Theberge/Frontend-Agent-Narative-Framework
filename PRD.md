# Product Requirements Document: AI Agent Framework Assistant

**Version:** 1.0
**Date:** 2024-07-25
**Status:** Draft
**Author:** Gemini AI (based on codebase review)

**1. Introduction**

The AI Agent Framework Assistant is a web-based application designed to assist front-end developers by providing AI-powered guidance, code examples, and interactive artifact rendering. It leverages the Vercel AI SDK and OpenAI models (GPT-4o), specifically tailored to support development with Next.js (App Router), React, TypeScript, Tailwind CSS, and Shadcn UI. The application aims to act as an architectural guide, code quality enhancer, and context-aware reasoning partner, incorporating principles from the Agent Narrative Framework mentioned in its system prompt.

**2. Goals**

*   **Empower Developers:** Provide accurate, context-aware AI assistance to accelerate front-end development tasks.
*   **Enforce Best Practices:** Guide users towards stable, scalable, and maintainable application architecture using modern standards (RSC, Suspense, TypeScript, etc.).
*   **Interactive Learning:** Allow users to view and interact with AI-generated React component artifacts in a sandboxed environment.
*   **Improve Productivity:** Offer a persistent chat workspace with history management and file handling capabilities.
*   **Facilitate Code Understanding:** Help developers understand and implement concepts related to the target tech stack.

**3. Target Audience**

*   **Primary:** Front-end developers actively working with or learning Next.js (App Router), React, TypeScript, Tailwind CSS, and Shadcn UI.
*   **Secondary:** Developers seeking AI assistance for code generation, debugging, or architectural advice within this specific technology ecosystem.

**4. Functional Requirements**

**4.1. Core Chat Interface**

*   **FR-CHAT-01:** Users must be able to input text messages into a chat interface.
*   **FR-CHAT-02:** The application must send user messages to the backend (API Route: `/api/chat`) for processing by an AI model (Configured for GPT-4o).
*   **FR-CHAT-03:** The application must display streaming responses from the AI model in the chat interface.
*   **FR-CHAT-04:** Messages must be clearly attributed to either the 'user' or the 'assistant'.
*   **FR-CHAT-05:** The interface must indicate when the AI is processing a request (e.g., loading state).
*   **FR-CHAT-06:** Users must be able to stop an ongoing AI response generation.
*   **FR-CHAT-07:** AI responses should render Markdown formatting, including code blocks with syntax highlighting.
*   **FR-CHAT-08:** The backend must utilize the defined system prompt to guide the AI's behavior and persona.
*   **FR-CHAT-09:** The application must support the *definition* of AI tools (as seen in `app/ai/tools.ts`). (Note: Full invocation logic, especially direct calls, might require further implementation).
*   **FR-CHAT-10:** The interface shall allow users to select an "Agent Mode" (e.g., 'normal', 'think', 'research'), which should be passed as metadata with user messages.

**4.2. Chat History Management**

*   **FR-HIST-01:** Conversations must be organized into distinct chat sessions.
*   **FR-HIST-02:** A sidebar must display a list of past chat sessions, showing at least a title and last updated timestamp.
*   **FR-HIST-03:** Users must be able to create a new chat session.
*   **FR-HIST-04:** Users must be able to select a chat session from the sidebar to view its messages.
*   **FR-HIST-05:** Users must be able to rename chat sessions.
*   **FR-HIST-06:** Users must be able to delete chat sessions (including their associated messages).
*   **FR-HIST-07:** Users must be able to pin important chat sessions, which should be visually distinct and potentially sorted higher in the list.
*   **FR-HIST-08:** Users must be able to archive chat sessions, hiding them from the main list but retaining the data. (Requires UI to view/manage archived chats - potentially future).
*   **FR-HIST-09:** Chat history (list of sessions and messages) must persist across browser sessions using `localStorage`.
*   **FR-HIST-10:** The application should automatically generate a title for new chats based on the first user message.
*   **FR-HIST-11:** The sidebar displaying the chat history must be collapsible.

**4.3. File Handling**

*   **FR-FILE-01:** Users must be able to attach files to their chat input.
*   **FR-FILE-02:** The interface must display previews for attached image files.
*   **FR-FILE-03:** The interface must display a list or indicators for other attached files.
*   **FR-FILE-04:** Users must be able to remove attached files before sending the message.
*   **FR-FILE-05:** When a message with attached text-based files (e.g., `.txt`, `.md`, `.js`, `.ts`, `.css`, `.html`, `.json`) is sent, the content of these files must be read and included alongside the user's text input in the payload sent to the AI.
*   **FR-FILE-06:** When a message with attached non-text files is sent, metadata (filename, type) should be included in the payload sent to the AI, indicating the file's presence.
*   **FR-FILE-07:** Attaching a text file should also append a user message containing the filename and formatted content for visibility in the chat history.

**4.4. Artifact Rendering**

*   **FR-ART-01:** The AI should be instructed to wrap React component code intended for rendering within a markdown code fence tagged `artifact`.
*   **FR-ART-02:** The application must identify `artifact` code blocks in AI responses and provide a mechanism (e.g., a button) to render them.
*   **FR-ART-03:** Artifact rendering must occur in an isolated environment (e.g., an iframe served from `/artifact-renderer`).
*   **FR-ART-04:** The rendering environment must use a Web Worker (`artifact-worker.js`) to transpile the received JSX/React code using Babel standalone.
*   **FR-ART-05:** The transpiled code must be evaluated safely within the rendering environment.
*   **FR-ART-06:** The rendering environment must render the `default export` of the evaluated component code.
*   **FR-ART-07:** Specific components (`React`, Shadcn `Button`, `Input`) must be available in the scope of the evaluated artifact code.
*   **FR-ART-08:** The rendering environment must handle and display errors occurring during transpilation or evaluation.
*   **FR-ART-09:** The rendering environment must provide a mechanism (triggered via `postMessage`) to capture a screenshot (using `html2canvas`) of the entire rendered artifact or a specific element within it (via selector).
*   **FR-ART-10:** Communication between the main application and the artifact renderer iframe must use `postMessage` with origin checks for security.

**4.5. Theming**

*   **FR-THEME-01:** The application must support both light and dark color themes.
*   **FR-THEME-02:** Users must be able to toggle between light and dark themes.
*   **FR-THEME-03:** The selected theme preference must persist across browser sessions using `localStorage`.

**(Potential/Latent) 4.6. Python Execution**

*   **FR-PY-01:** A Web Worker (`pyodide-worker.js`) must be configured to load and initialize Pyodide.
*   **FR-PY-02:** The worker must be able to receive Python code strings from the main application.
*   **FR-PY-03:** The worker must execute the received Python code using Pyodide.
*   **FR-PY-04:** The worker must capture `stdout` and `stderr` from the Python execution and send them back to the main application.
*   **FR-PY-05:** The worker must report execution status (ready, executing, executed, error) back to the main application.
*   **(Note:** The triggering mechanism and display logic within the main UI are not currently specified/implemented based on the review).

**5. Non-Functional Requirements**

*   **NFR-PERF-01:** The UI must remain responsive during AI response streaming and artifact rendering initiation.
*   **NFR-PERF-02:** CPU-intensive tasks (code transpilation, potential Python execution) must occur in Web Workers to avoid blocking the main thread.
*   **NFR-PERF-03:** `localStorage` operations should be efficient and not cause noticeable UI freezes, even with significant chat history.
*   **NFR-PERF-04:** Aim for good Core Web Vitals scores for the main application pages.
*   **NFR-SEC-01:** Artifact rendering must be securely sandboxed using an iframe.
*   **NFR-SEC-02:** Cross-origin communication (`postMessage`) must validate origins.
*   **NFR-SEC-03:** Basic input sanitization should be applied to user inputs displayed in the UI. (Further hardening for code evaluation is recommended).
*   **NFR-USE-01:** The user interface must be intuitive and follow standard web conventions.
*   **NFR-USE-02:** Provide clear visual feedback for loading states, actions, and errors (using toasts via Sonner).
*   **NFR-USE-03:** The application must be responsive and usable across common desktop screen sizes.
*   **NFR-MAINT-01:** Code must adhere to TypeScript best practices, functional programming patterns, and the project's established style guide (as per custom instructions).
*   **NFR-MAINT-02:** Code should be modular, well-structured, and appropriately commented (especially for complex logic).
*   **NFR-REL-01:** The application should handle API errors and worker errors gracefully, informing the user without crashing.

**6. Design & UI/UX**

*   Utilize Shadcn UI components for core UI elements.
*   Employ Tailwind CSS for layout, styling, and responsiveness.
*   Maintain a clean, minimal, and professional aesthetic suitable for a developer tool.
*   Ensure clear visual hierarchy and readability of text and code.
*   Follow accessibility best practices (semantic HTML, keyboard navigation, contrast ratios).
*   Implement a mobile-first responsive design approach.

**7. Future Considerations / Out of Scope (for V1)**

*   Real-time multi-user collaboration.
*   Advanced state management solutions (Zustand, Jotai).
*   Full implementation and UI integration for Python execution via Pyodide.
*   Integration of MagicUI or Aceturnity UI components.
*   Backend persistence (database) instead of `localStorage`.
*   User authentication/accounts.
*   Advanced security hardening for artifact code evaluation (AST analysis, stricter sandboxing).
*   Comprehensive automated testing suite (Unit, Integration, E2E).
*   Support for AI models other than OpenAI.
*   Dedicated view/management for archived chats.
*   More sophisticated file handling (e.g., diff views, editing).

**8. Release Criteria / Success Metrics**

*   **Release Criteria:**
    *   All defined Functional Requirements (sections 4.1-4.5) are implemented and pass testing.
    *   Core Non-Functional Requirements (Performance, Security basics, Usability) are met.
    *   No critical or major bugs identified in core workflows (chatting, history management, artifact rendering).
    *   Application is stable and deployable.
*   **Success Metrics:**
    *   User engagement: Daily/Monthly Active Users, average session duration, messages sent per session.
    *   Feature adoption: Frequency of artifact rendering, file attachment usage, chat history interactions (pin/archive).
    *   User satisfaction: Qualitative feedback (surveys, interviews), low bounce rate.
    *   Performance: Core Web Vitals scores, low client-side error rates (reported via monitoring).
    *   Task completion: (If measurable) Success rate of artifact rendering without errors.

**9. Open Questions**

*   What is the definitive role and workflow for the Server Action (`app/actions.ts`) versus the API route (`app/api/chat/route.ts`)? Should one be deprecated?
*   What are the specific user-facing requirements for Python execution, if it's intended for V1? How should it be triggered and results displayed?
*   Are MagicUI and Aceturnity UI still desired integrations? If so, where?
*   What are the scalability expectations for `localStorage`? At what point would a backend database be necessary?
*   Are there specific security thresholds or compliance requirements for code evaluation?

--- 