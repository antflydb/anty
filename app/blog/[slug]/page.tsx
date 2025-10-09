import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/markdown";
import { Calendar, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">SearchAF</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Documentation
              </Link>
              <Link href="/guides" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Guides
              </Link>
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="container max-w-4xl py-12">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
          >
            ← Back to Blog
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
            {post.description && (
              <p className="text-xl text-muted-foreground mb-4">{post.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold mb-4">SearchAF</h3>
              <p className="text-sm text-muted-foreground">
                Product search and discovery powered by AntflyDB.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="text-muted-foreground hover:text-foreground">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://antfly.io" className="text-muted-foreground hover:text-foreground">
                    About AntflyDB
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SearchAF. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
