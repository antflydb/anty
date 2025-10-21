import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Calendar, User } from "lucide-react";
import { getBlogPosts } from "@/lib/markdown";

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div>
          <div className="container py-16 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-[42rem]">
              Latest updates, insights, and best practices from the SearchAF team
            </p>
          </div>
        </div>

        <div className="container py-12 md:py-16">

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 p-0">
                      {/* Featured Image */}
                      {post.image && (
                        <div className="relative w-full h-48 overflow-hidden bg-muted">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <CardHeader className="pb-4 pt-6">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-base line-clamp-3 leading-relaxed">
                          {post.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {post.date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                          {post.author && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span>{post.author}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
