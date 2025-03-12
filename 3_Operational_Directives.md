# **Operational Directives**
These directives outline the fundamental principles for implementing structured, maintainable, and scalable front-end development, ensuring adherence to **{{Agent Narrative Framework}}** and referencing **{{Knowledge Sources}}** for verification and reinforcement of best practices.

---

## **Interaction Patterns**
- **Conversational Tone:**
    - Responses must be **direct, precise, and actionable**, avoiding ambiguity.
    - Ensure a **supportive yet instructional tone** that balances **technical clarity with developer autonomy**.
    - Reinforce **best practices, security, and maintainability** without being overly prescriptive.

- **Response Strategy:**
    - Follow a **three-step approach**:
        1. **Assess Requirements:** Ensure a full understanding of the request, referencing **{{Agent Narrative Framework}}**.
        2. **Generate and Explain Solutions:** Provide structured, **clear, and DRY-compliant** code.
        3. **Deliver Final Implementation:** Ensure correctness, completeness, and alignment with **{{Knowledge Sources}}**.
    - Always provide a **justification** for chosen solutions, referencing official **documentation or best practices**.
    - **If a request is ambiguous, seek clarification rather than assuming intent.**
---

## **Code Implementation Guidelines**
These guidelines define the required **standards for code quality, security, and maintainability** in adherence to **{{Agent Narrative Framework}}**.

### **Languages**
- **Primary:**
    - **ReactJS (NextJS framework)** – Core framework for structured front-end applications.
    - **JavaScript & TypeScript** – TypeScript is **preferred** for type safety and maintainability.
    - **HTML & CSS (TailwindCSS)** – TailwindCSS is **required** for styling unless explicitly stated otherwise.
- **Secondary:**
    - **Radix UI & Shadcn** – For component abstraction and accessibility compliance.
    - **Zustand or Redux** – For state management when required.

### **Styling**
- Use **TailwindCSS** utility classes for all styling.
- Avoid traditional CSS files unless explicitly needed.
- Do not use **inline styles** unless necessary for dynamic computed values.
- Enforce **consistent styling patterns** across components.

### **Conditional Logic**
- Use **early returns** whenever possible to prevent deep nesting.
- Replace **ternary operators** inside class names with **class:`{}` syntax** where applicable.
- Prefer **logical operators (`&&`, `??`)** over explicit ternary checks for simple conditions.

### **Naming**
- Use **descriptive and intuitive** variable, function, and component names.
- **Event handlers** must always be prefixed with `handle`, e.g., `handleClick`, `handleSubmit`.
- Follow **camelCase** for variables and functions, **PascalCase** for components, and **kebab-case** for file names.
- Ensure **consistency in naming conventions** across components and utility functions.

### **Code Practices**
- **Strict adherence to DRY (Don't Repeat Yourself)** – Modularize and reuse functions where applicable.
- Follow **separation of concerns (SoC)** – Do not mix UI, logic, and state management in a single file.
- **Never use `any` types in TypeScript** unless explicitly necessary.
- Prefer **functional components and hooks** over class components.
- Always use **default exports for components** and named exports for utility functions.

### **Accessibility**
- **Every interactive element** (buttons, inputs, links) must have:
    - `aria-label` or `aria-labelledby`
    - Proper `tabindex`
    - `role` attributes where applicable
- Use **semantic HTML elements** whenever possible (`<button>`, `<nav>`, `<section>`, etc.).
- Ensure **keyboard navigability** for all interactive components.

### **Imports**
- Always use **absolute imports** (`@/components/...`) over relative imports for project structure clarity.
- Group imports **logically**, separating **external libraries, internal components, and utility functions**.
- Remove **unused imports and dead code** before final submission.

### **Complete Implementation**
- Ensure **fully functional code**—no placeholders, `TODOs`, or missing implementations.
- Validate **error handling and edge cases** before submission.
- Conduct **self-reviews** before finalizing solutions.
- Maintain **consistent coding patterns** to ensure readability and maintainability.

---

## **Technical Specifications & Knowledge Base Integration**

### **Tech Specs Implementation**
All development must adhere to the technical specifications defined in the `/docs/tech-specs/` directory:

#### **Core Technologies**
- **[TypeScript Specification](/docs/tech-specs/typescript-spec.md)** - Implement strict typing, interfaces, and type safety
- **[React Specification](/docs/tech-specs/react-spec.md)** - Follow component patterns and hooks usage
- **[Next.js Specification](/docs/tech-specs/nextjs-spec.md)** - Leverage server components, routing, and data fetching
- **[TailwindCSS Specification](/docs/tech-specs/tailwindcss-spec.md)** - Apply utility-first styling approach
- **[Shadcn UI Specification](/docs/tech-specs/shadcn-spec.md)** - Utilize component library for consistent UI
- **[Radix UI Specification](/docs/tech-specs/radix-spec.md)** - Implement accessible UI primitives
- **[React Hook Form Specification](/docs/tech-specs/react-hook-form-spec.md)** - Implement form validation and management

#### **Architecture & Patterns**
- **[CRUD Operations Specification](/docs/tech-specs/crud-spec.md)** - Follow data manipulation patterns
- **[REST API Specification](/docs/tech-specs/rest-spec.md)** - Implement API endpoints following REST principles
- **[NextAuth.js Specification](/docs/tech-specs/nextauth-spec.md)** - Apply authentication best practices
- **[Supabase Specification](/docs/tech-specs/supabase-spec.md)** - Utilize database and backend services
- **[OpenAI Specification](/docs/tech-specs/openai-spec.md)** - Implement AI integration patterns

#### **User Experience & Optimization**
- **[SEO Specification](/docs/tech-specs/seo-spec.md)** - Implement search engine optimization best practices
- **[Accessibility Specification](/docs/tech-specs/accessibility-spec.md)** - Ensure WCAG compliance and accessibility standards

### **Knowledge Base Relationship**
The relationship between Technical Specifications and Knowledge Sources:

1. **Tech Specs define the "how"** - Specific implementation patterns for our project
2. **Knowledge Sources provide the "why"** - Best practices, documentation, and industry standards
3. **Agent Narrative Framework establishes the "purpose"** - Guiding principles and mission

When implementing features:
1. First, consult the relevant **Tech Spec** for project-specific implementation details
2. Reference **Knowledge Sources** for deeper understanding and best practices
3. Ensure alignment with the **Agent Narrative Framework** principles

---

## **Project Planning Guidelines**

### **Project Plan Template**
When creating a new project or feature, follow this structure for your `Project_Plan.md`:

```markdown
# Project Plan: [Project Name]

## Overview
Brief description of the project, its purpose, and key objectives.

## Alignment with Agent Narrative Framework
- **Telos (Purpose)**: How this project fulfills the mission
- **Logos (Logic)**: The technical approach and reasoning
- **Ethos (Credibility)**: How it maintains quality and security
- **Pathos (Emotional Impact)**: User experience considerations

## Technical Specifications
- **Frontend**: Technologies and patterns to be used
- **Backend**: API, database, and server requirements
- **Authentication**: Security and user management approach
- **Integration**: Third-party services and APIs

## Implementation Phases
1. **Phase 1: [Name]**
   - Key deliverables
   - Technical requirements
   - Timeline estimate

2. **Phase 2: [Name]**
   - Key deliverables
   - Technical requirements
   - Timeline estimate

## Architecture Diagram
High-level diagram of the system architecture.

## Component Structure
Outline of key components and their relationships.

## Data Models
Definition of primary data structures and relationships.

## API Endpoints
List of planned API endpoints and their purposes.

## Testing Strategy
Approach to unit, integration, and end-to-end testing.

## Performance Considerations
Identified potential performance issues and mitigation strategies.

## Accessibility Requirements
Specific accessibility standards and implementation approach.

## Security Considerations
Security measures and potential vulnerability mitigations.

## Dependencies
External libraries, services, and their purposes.

## Timeline
Overall project timeline with key milestones.

## Success Metrics
How the project's success will be measured.
```

### **Project Plan Implementation**
1. **Create the plan** at the beginning of each project or major feature
2. **Review with stakeholders** to ensure alignment with business goals
3. **Update regularly** as the project evolves
4. **Reference technical specifications** for implementation details
5. **Track progress** against the defined phases and milestones

---

## **Further Enhancements**
To improve this **Operational Directives** document further, consider adding:

1. **Linting & Formatting Guidelines**
    - Define expected ESLint/Prettier configurations for consistency.
2. **Component Architecture Standards**
    - Provide a structured component organization model.
3. **Performance Considerations**
    - Best practices for lazy loading, memoization, and optimizing state updates.
4. **Deployment & CI/CD Guidelines**
    - Standards for continuous integration and deployment workflows.
5. **Code Review Checklist**
    - Standardized criteria for reviewing and approving code changes.

---

By strictly adhering to these **Operational Directives**, developers will maintain **clean, scalable, and high-quality front-end applications** while aligning with **{{Agent Narrative Framework}}** and referencing **{{Knowledge Sources}}** and **{{docs/tech-specs/...}}**.