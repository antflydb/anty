# Task: Refactor Documentation Architecture from Nextra to Native MDX

## Objective:

The goal of this task is to refactor the existing website's documentation section (`/docs`). We will be removing the dependency on the Nextra library and re-implementing the documentation using a native, file-based MDX architecture, processed directly by Next.js. This change will align our project with the modern, flexible "content-as-code" strategy used by the official `nextjs.org` website, giving us greater control over layout, styling, and content rendering.

## Context:

The current implementation uses `nextra` and `nextra-theme-docs` to generate the `/docs` section. This task involves migrating away from that setup to a more fundamental and powerful pattern using the App Router's dynamic routes to render MDX files from a dedicated `content` directory.

## High-Level Requirements:

  * Completely remove all Nextra-related dependencies and configurations.
  * Migrate all documentation content to a new `content/docs` directory at the project root.
  * Implement a new dynamic route handler at `app/docs/[...slug]/page.tsx` to render the MDX content.
  * Create a custom, shared layout for the documentation section that includes a manually configured sidebar.
  * The API reference must be refactored from an OpenAPI-driven approach to manually authored `.mdx` files.

## Instructions

**1. Decommission Nextra**

  * Uninstall all Nextra-related packages from the project.
    ```bash
    npm uninstall nextra nextra-theme-docs
    ```
  * Clean the `next.config.mjs` file by removing the `withNextra` wrapper and any other Nextra-specific configurations. The file should be a standard Next.js configuration object.
  * Delete the Nextra theme configuration file (`theme.config.jsx`).
  * Delete the `pages` directory, as its contents will be replaced by the App Router implementation.

**2. Configure Native MDX Processing**

  * Install the necessary packages to allow Next.js to process MDX files natively.
    ```bash
    npm install @next/mdx remark-gfm
    ```
  * Update `next.config.mjs` to use the `@next/mdx` plugin. This will enable Next.js to recognize and render `.mdx` files as React components.

**3. Reorganize Content Directory Structure**

  * Create a new `content` directory at the root of the project.
  * Inside `content`, create a `docs` subdirectory.
  * Move all existing documentation `.mdx` files into `content/docs`.
  * **Crucially, disregard the `openapi.yaml` file.** Create a new subdirectory `content/docs/api` and populate it with placeholder `.mdx` files for the API reference (e.g., `overview.mdx`, `endpoints.mdx`).

**4. Implement the Documentation Rendering Logic**

  * Create a new dynamic route handler at `app/docs/[...slug]/page.tsx`.
  * This component will be responsible for:
      * Receiving the `slug` from the URL parameters.
      * Locating the corresponding `.mdx` file within the `content/docs` directory.
      * Dynamically importing the MDX file as a component and rendering it.
      * Handling cases where a file is not found (404).

**5. Build the Custom Documentation Layout and Sidebar**

  * Create a shared layout file for the documentation section at `app/docs/layout.tsx`. This layout will define the persistent UI wrapper for all doc pages, including the header, footer, and a dedicated area for the sidebar.
  * Create a new configuration file (e.g., `config/docs-navigation.ts`). This file will export a data structure (e.g., an array of objects) that defines the entire sidebar navigation tree, including sections, page titles, and corresponding links. This replaces Nextra's `_meta.json` functionality.
  * Within `app/docs/layout.tsx`, create a `Sidebar` component that imports the navigation configuration and renders the navigation links. This sidebar should be a static component, not dynamically generated from the file system.

**6. Verify the Refactor**

  * Run the development server.
  * Confirm that the main marketing homepage at `/` renders correctly and is completely unaffected by the documentation layout.
  * Navigate to a documentation URL (e.g., `/docs/getting-started`). Verify that the content from the corresponding `.mdx` file is rendered correctly within the new custom documentation layout.
  * Confirm that the new, manually configured sidebar is visible, functional, and accurately reflects the structure defined in your navigation configuration file.

## Updated Clarifying Questions & Answers

**Q: OpenAPI Spec?**
A: We are moving away from this. The API reference must be refactored into manually authored `.mdx` files located in `content/docs/api/`. The `openapi.yaml` file should be ignored and can be deleted.

**Q: Nextra Theme?**
A: No, the `nextra-theme-docs` dependency must be removed. You will build a new, custom layout and sidebar for the `/docs` section using the project's existing shadcn/ui components and Tailwind CSS styling.

**Q: Content Priorities?**
A: All existing content must be migrated. Create placeholder `.mdx` files for the API reference to ensure the new routing and layout structure works end-to-end.