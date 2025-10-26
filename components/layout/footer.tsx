import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-10 md:py-12 lg:py-16">
      <div className="container px-4">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
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
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Documentation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Getting started
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-muted-foreground hover:text-foreground transition-colors">
                  API reference
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://antfly.io" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Antfly
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SearchAF. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
