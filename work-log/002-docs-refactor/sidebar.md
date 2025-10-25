### Docs Sidebar: Styling and Requirements

The sidebar should be a custom-built React component that is statically rendered as part of the shared documentation layout. It is **not** automatically generated from the file system.

**Functional Requirements:**

*   **Manual Configuration:** The navigation structure (sections, page titles, and links) must be defined manually in a dedicated configuration file (e.g., `config/docs-navigation.ts`). This provides explicit control over the order and hierarchy.
*   **Active State:** The sidebar must visually highlight the link corresponding to the currently active page. This can be implemented using the `usePathname` hook to compare the current URL against the links in the navigation config.
*   **Collapsible Sections:** Top-level categories should be collapsible to keep the navigation clean and manageable, especially for documentation with many pages.
*   **Responsiveness:** The sidebar must be fully responsive. On larger screens, it should be persistently visible. On smaller screens, it should collapse into a hamburger menu that can be toggled.

**Styling Requirements:**

*   **Framework:** All styling must be implemented using **Tailwind CSS** utility classes.[1, 2, 3] No custom CSS files or CSS-in-JS should be necessary.
*   **Aesthetics:** The design should be clean, minimalist, and prioritize readability. Use subtle background colors to differentiate it from the main content area, and use clear visual cues for hover and active states on links.
*   **Typography:** Text should be legible, with a clear visual hierarchy. Section titles should be more prominent than individual page links.
*   **Accessibility:** The component must be fully accessible.[4] This includes using semantic HTML (`<nav>`, `<ul>`, `<li>`, `<a>`), ensuring it is keyboard-navigable, and providing distinct focus states for all interactive elements.