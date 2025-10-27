import { notFound } from 'next/navigation'
import path from 'path'
import fs from 'fs'
import { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

async function getMdxContent(slug: string[]) {
  const slugPath = slug.join('/')
  const filePath = path.join(process.cwd(), 'content', 'docs', `${slugPath}.mdx`)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    // Read the MDX file
    const source = fs.readFileSync(filePath, 'utf8')

    // Dynamically import ESM-only rehype plugins
    const [rehypeSlug, rehypeAutolinkHeadings] = await Promise.all([
      import('rehype-slug').then(mod => mod.default),
      import('rehype-autolink-headings').then(mod => mod.default)
    ])

    // Compile the MDX
    const { content } = await compileMDX({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, {
              behavior: 'append',
              properties: {
                className: ['heading-anchor'],
                ariaLabel: 'Link to section',
              },
              content: {
                type: 'element',
                tagName: 'span',
                properties: { className: ['anchor-icon'] },
                children: [{ type: 'text', value: '#' }]
              }
            }],
          ],
        },
      },
    })

    return content
  } catch (error) {
    console.error(`Error loading MDX file: ${filePath}`, error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params

  // Create a title from the slug
  const title = slug.length > 0
    ? slug[slug.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Documentation'

  return {
    title: `${title} - SearchAF Documentation`,
    description: 'SearchAF documentation - Product search and discovery powered by AntflyDB',
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params

  // Handle root docs page
  const actualSlug = slug.length === 0 ? ['index'] : slug

  const content = await getMdxContent(actualSlug)

  if (!content) {
    notFound()
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      {content}
    </article>
  )
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'content', 'docs')

  function getDocFiles(dir: string, basePath: string = ''): { slug: string[] }[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const paths: { slug: string[] }[] = []

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        paths.push(...getDocFiles(fullPath, relativePath))
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const slug = relativePath
          .replace(/\.mdx$/, '')
          .split('/')
          .filter(s => s !== 'index')

        if (relativePath.endsWith('index.mdx')) {
          paths.push({ slug: [] })
        } else {
          paths.push({ slug })
        }
      }
    }

    return paths
  }

  return getDocFiles(docsDir)
}
