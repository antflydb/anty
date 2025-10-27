# SearchAF Website - Project Summary

## Overview

Successfully built a comprehensive Next.js 15 website for SearchAF, an answer engine that provides an answer bar to elevate the traditional search experience, powered by Antfly. The site includes a marketing homepage, documentation powered by Nextra, guides section, and blog - all with SSR capabilities.

## Technology Stack

- **Next.js 15** - App Router with SSR
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Modern styling
- **shadcn/ui** - Component library
- **Nextra** - Documentation framework
- **React Hook Form + Zod** - Form validation
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Site Structure

### 1. Homepage (`/`)
- Hero section with value proposition
- Feature showcase (6 key features)
- Platform integrations
- CTA sections
- Professional navigation and footer

### 2. Documentation (`/docs`)
Powered by Nextra with:
- **Introduction** - Overview and quick start
- **Authentication** - OAuth and API key documentation
- **API Reference** - Complete endpoint listing
- Sidebar navigation configured
- OpenAPI spec available at `/openapi.yaml`

### 3. Guides (`/guides`)
Markdown-based guide system with:
- **Getting Started** - Initial setup guide
- **Shopify Integration** - Platform-specific guide
- **Semantic Search** - Advanced features
- Dynamic routing for individual guides
- Metadata support (category, read time)

### 4. Blog (`/blog`)
Markdown-based blog with:
- **Introducing SearchAF** - Launch announcement
- **Vector Search Explained** - Technical deep dive
- Date-based sorting
- Author attribution
- Dynamic routing for posts

## Key Features

### Markdown Support
- Gray-matter for frontmatter parsing
- React-markdown for rendering
- Support for both `.md` and `.mdx` files

### Responsive Design
- Mobile-first approach
- Sticky navigation
- Responsive grids and layouts

### Navigation
- Consistent header across all pages
- Active link states
- Smooth transitions

### Content Management
Simple file-based system:
- Add guides: `/content/guides/*.md`
- Add blogs: `/content/blog/*.md`
- Add docs: `/pages/docs/*.mdx`

## Running the Project

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The site runs on `http://localhost:3000`

## Routes

- `/` - Homepage
- `/docs` - Documentation
- `/docs/authentication` - Auth docs
- `/docs/api` - API reference
- `/guides` - Guides listing
- `/guides/[slug]` - Individual guide
- `/blog` - Blog listing
- `/blog/[slug]` - Individual post

## Content Structure

```
content/
├── guides/
│   ├── getting-started.md
│   ├── shopify-integration.md
│   └── semantic-search.md
└── blog/
    ├── introducing-searchaf.md
    └── vector-search-explained.md

pages/
└── docs/
    ├── _meta.json
    ├── index.mdx
    ├── authentication.mdx
    └── api.mdx
```

## Next Steps

To prepare for static deployment to GitHub Pages:

1. Add `output: 'export'` to `next.config.mjs`
2. Configure base path if needed
3. Update image optimization for static export
4. Run `npm run build` to generate static files
5. Deploy the `out` directory to GitHub Pages

## Customization

### Adding New Guides
1. Create `/content/guides/your-guide.md`
2. Add frontmatter:
   ```yaml
   ---
   title: Your Title
   description: Your description
   category: Category
   readTime: X min read
   ---
   ```
3. Write content in markdown
4. Guide automatically appears on `/guides`

### Adding New Blog Posts
1. Create `/content/blog/your-post.md`
2. Add frontmatter:
   ```yaml
   ---
   title: Your Title
   description: Your description
   date: YYYY-MM-DD
   author: Your Name
   ---
   ```
3. Write content in markdown
4. Post automatically appears on `/blog`

### Adding Documentation
1. Create `/pages/docs/your-page.mdx`
2. Update `/pages/docs/_meta.json` for sidebar
3. Write content in MDX format

## Notes

- OpenAPI spec is integrated and available at `/openapi.yaml`
- All routes are server-side rendered (SSR)
- The site uses file-system based routing
- shadcn/ui components are pre-configured
- Dark mode support via Nextra theme
