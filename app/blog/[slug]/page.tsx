import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/markdown";
import { Header } from "@/components/layout/header";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Calendar, User, ArrowLeft } from "lucide-react";

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
      <Header />

      <main className="flex-1 bg-background">
        <article className="container max-w-4xl py-12 md:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Blog</span>
          </Link>

          <header className="mb-12 md:mb-16">
            {/* Featured Image */}
            {post.image && (
              <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl mb-10 md:mb-12 bg-muted">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 md:mb-8 leading-[1.1] text-foreground">{post.title}</h1>
            {post.description && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 leading-relaxed font-light">{post.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-6 border-t border-border/30">
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
          </header>

          <div className="mb-16 md:mb-20">
            <MarkdownContent content={post.content} />
          </div>

          <div className="pt-8 border-t border-border/30">
            <ShareButtons
              title={post.title}
              url={`https://searchaf.antfly.io/blog/${post.slug}`}
            />
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/af-logo.svg"
                  alt="SearchAF Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="text-base logo-text">
                  <span style={{ fontWeight: 400 }}>search</span>
                  <span style={{ fontWeight: 700 }}>af</span>
                </span>
              </Link>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                    Getting started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="text-muted-foreground hover:text-foreground">
                    API reference
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
                    About Antfly
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
