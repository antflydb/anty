import { notFound } from "next/navigation";
import Link from "next/link";
import { getGuideBySlug, getGuides } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export async function generateStaticParams() {
  const guides = getGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-1">
        <article className="container max-w-4xl py-12">
          <Link
            href="/guides"
            className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
          >
            ← Back to Guides
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              {guide.category && <Badge variant="secondary">{guide.category}</Badge>}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{guide.title}</h1>
            {guide.description && (
              <p className="text-xl text-muted-foreground">{guide.description}</p>
            )}
          </div>

          <MarkdownContent content={guide.content} />
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
