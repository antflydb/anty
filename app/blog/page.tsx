import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
      <Footer />
    </div>
  );
}
