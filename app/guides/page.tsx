import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { BookOpen, Clock } from "lucide-react";
import { getGuides } from "@/lib/markdown";

export default function GuidesPage() {
  const guides = getGuides();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Guides</h1>
            <p className="text-xl text-muted-foreground max-w-[42rem]">
              Step-by-step guides to help you get the most out of SearchAF
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{guide.category}</Badge>
                    </div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{guide.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
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
