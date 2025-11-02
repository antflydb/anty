import { Sidebar } from '@/components/docs/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/af-logo.svg"
              alt="SearchAF Logo"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="hidden sm:inline text-xl logo-text relative" style={{ top: '-2px' }}>
              <span style={{ fontWeight: 400 }}>search</span>
              <span style={{ fontWeight: 700 }}>af</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              Docs
            </Link>
            <Link
              href="/guides"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              Guides
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              Blog
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar className="w-72" />

          {/* Main content */}
          <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} SearchAF. Product search and discovery powered by AntflyDB.
            </p>
            <div className="flex gap-6">
              <Link
                href="/support"
                className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                Support
              </Link>
              <a
                href="https://github.com/antflydb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
