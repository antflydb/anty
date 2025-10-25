export interface NavItem {
  title: string
  href?: string
  items?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const docsNavigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Introduction',
        href: '/docs',
      },
      {
        title: 'Authentication',
        href: '/docs/authentication',
      },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      {
        title: 'Organizations',
        href: '/docs/organizations',
      },
      {
        title: 'Projects',
        href: '/docs/projects',
      },
      {
        title: 'Usage & Analytics',
        href: '/docs/usage',
      },
    ],
  },
  {
    title: 'API Reference',
    items: [
      {
        title: 'Overview',
        href: '/docs/api',
      },
      {
        title: 'API Documentation',
        items: [
          {
            title: 'API Overview',
            href: '/docs/api/overview',
          },
          {
            title: 'Authentication',
            href: '/docs/api/authentication',
          },
          {
            title: 'Endpoints',
            href: '/docs/api/endpoints',
          },
          {
            title: 'Search API',
            href: '/docs/api/search',
          },
        ],
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        title: 'Webhooks',
        href: '/docs/webhooks',
      },
    ],
  },
]
