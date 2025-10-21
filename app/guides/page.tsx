import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { BookOpen, Clock, ArrowRight, Zap, Puzzle, Wrench } from "lucide-react";
import { getGuides } from "@/lib/markdown";

export default function GuidesPage() {
  const guides = getGuides();

  // Group guides by category
  const groupedGuides = guides.reduce((acc, guide) => {
    const category = guide.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(guide);
    return acc;
  }, {} as Record<string, typeof guides>);

  // Category icons and descriptions
  const categoryInfo: Record<string, { icon: any; description: string; order: number }> = {
    'Quickstart': {
      icon: Zap,
      description: 'Get up and running quickly with SearchAF',
      order: 1
    },
    'Integration': {
      icon: Puzzle,
      description: 'Connect SearchAF with your platform',
      order: 2
    },
    'Advanced': {
      icon: Wrench,
      description: 'Advanced features and optimization',
      order: 3
    }
  };

  // Sort categories by order
  const sortedCategories = Object.keys(groupedGuides).sort((a, b) => {
    const orderA = categoryInfo[a]?.order || 999;
    const orderB = categoryInfo[b]?.order || 999;
    return orderA - orderB;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div>
          <div className="container py-16 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Guides</h1>
            <p className="text-xl text-muted-foreground max-w-[42rem]">
              Step-by-step guides to help you integrate, configure, and optimize SearchAF for your e-commerce platform.
            </p>
          </div>
        </div>

        {/* Guides by Category */}
        <div className="container py-12 md:py-16">
          <div className="space-y-16 max-w-[1100px] mx-auto">
            {sortedCategories.map((category) => {
              const CategoryIcon = categoryInfo[category]?.icon || BookOpen;
              const categoryGuides = groupedGuides[category];

              return (
                <section key={category}>
                  {/* Category Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                    </div>
                    {categoryInfo[category]?.description && (
                      <p className="text-muted-foreground ml-11">
                        {categoryInfo[category].description}
                      </p>
                    )}
                  </div>

                  {/* Guide List */}
                  <div className="space-y-4">
                    {categoryGuides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={`/guides/${guide.slug}`}
                        className="block group"
                      >
                        <div className="border rounded-lg p-6 transition-all hover:border-primary hover:shadow-md hover:bg-muted/50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                  {guide.title}
                                </h3>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                              </div>
                              <p className="text-muted-foreground mb-3 leading-relaxed">
                                {guide.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                {guide.category && (
                                  <Badge variant="secondary" className="font-normal">
                                    {guide.category}
                                  </Badge>
                                )}
                                {guide.readTime && (
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{guide.readTime}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
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
