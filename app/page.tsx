import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Zap, Shield, Database, Code, TrendingUp } from "lucide-react";

export default function Home() {
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
              <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/docs">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center text-center py-24 space-y-8">
        <Badge variant="secondary" className="mb-4">
          Powered by AntflyDB
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Product Search & Discovery
          <br />
          <span className="text-primary">Built for the AI Era</span>
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          SearchAF delivers cutting-edge product search and discovery capabilities on top of AntflyDB,
          a distributed vector database combining proven distributed systems with AI-powered semantic search.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/docs">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/api">API Reference</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Why Choose SearchAF?
          </h2>
          <p className="text-muted-foreground max-w-[42rem] mx-auto">
            Enterprise-grade search infrastructure with AI-powered capabilities
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Search className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                AI-powered vector search that understands intent and context, not just keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Leverage cutting-edge embedding models to deliver search results that truly match user intent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Optimized for speed with sub-millisecond query performance at scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built on AntflyDB&apos;s distributed architecture for horizontal scalability and reliability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Enterprise Ready</CardTitle>
              <CardDescription>
                Production-grade infrastructure with enterprise security and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                OAuth integration, role-based access control, and comprehensive audit logging.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Vector Database</CardTitle>
              <CardDescription>
                Purpose-built for AI applications with hybrid search capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Combine traditional database features with advanced vector search in one platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Developer Friendly</CardTitle>
              <CardDescription>
                RESTful API with comprehensive SDKs and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get up and running in minutes with our intuitive API and detailed guides.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Built-in analytics and monitoring for search performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track usage metrics, monitor quotas, and optimize your search experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Support */}
      <section className="border-t bg-muted/50">
        <div className="container py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Integrations
            </h2>
            <p className="text-muted-foreground max-w-[42rem] mx-auto">
              Seamlessly integrate with your existing e-commerce platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Shopify</CardTitle>
                <CardDescription>
                  Native Shopify app integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>WooCommerce</CardTitle>
                <CardDescription>
                  WordPress plugin for WooCommerce
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Custom</CardTitle>
                <CardDescription>
                  RESTful API for any platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-[42rem] mx-auto mb-8">
            Start building with SearchAF today. Check out our documentation and guides to begin.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/docs">
                Read the Docs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/guides">View Guides</Link>
            </Button>
          </div>
        </div>
      </section>

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
