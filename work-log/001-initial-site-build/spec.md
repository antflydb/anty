# Initial Site Build

## Objective:
Your task is to create a single Next.js application that serves a main marketing site from the root (`/`) and a documentation section from a sub-path (`/docs`). The documentation section will be powered by Nextra. This setup should follow the "Integrated Monolith" architecture where Nextra acts as a plugin within the main Next.js app.

## Requirements:
- Use `create-next-app` for the initial setup.
- Configure Nextra to only handle routes under the `/docs` path.
- The main application routes (e.g., the homepage) should not be affected by Nextra's theme or styling.

## Instructions
1. Create a new Next.js project
2. Install Nextra dependencies
3. Configure `next.config.mjs`, specifying that Nextra should only manage the content for the `/docs` route.
4. Create the directory structure and content for the main application, and the Nextra documentation content
    a. Create the main application homepage (`app/page.tsx`)
    b. Create a `pages` directory at the root of the project.
    c. Create the documentation files inside the `pages/docs` subdirectory.
    d. Create the sidebar configuration for the docs to control the order and titles in the Nextra sidebar.
    e. Create a basic theme configuration file.
5. Verify the setup

Use all the time you need to accomplish the tasks.

## Clarifying Questions & Answers

**Q: Domain/Branding?**
A: Use SearchAF branding as described in CLAUDE.md

**Q: OpenAPI Spec?**
A: The OpenAPI spec is in the root directory (openapi.yaml)

**Q: Content Priorities?**
A: All sections are critical - homepage, API reference, guides, blog

**Q: Design Direction?**
A: Use existing shadcn/ui components and Tailwind CSS 4+ styling only (no custom designs)

**Q: Static Export?**
A: Build with SSR capabilities first (not static export initially)

**Q: Existing Content?**
A: Only the API reference in the OpenAPI spec. Provide placeholders for other sections.

**Q: Nextra Theme?**
A: Yes, use nextra-theme-docs for the /docs section