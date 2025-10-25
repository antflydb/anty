'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { docsNavigation, type NavItem } from '@/config/docs-navigation'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

interface NavItemProps {
  item: NavItem
  level?: number
}

function NavItemComponent({ item, level = 0 }: NavItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href === pathname

  if (hasChildren) {
    return (
      <div>
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
              !isActive && 'text-slate-700 dark:text-slate-300',
              level > 0 && 'ml-4'
            )}
          >
            <span>{item.title}</span>
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsOpen(!isOpen)
              }}
              className="ml-2"
              aria-label={isOpen ? 'Collapse' : 'Expand'}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </Link>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'text-slate-700 dark:text-slate-300',
              level > 0 && 'ml-4'
            )}
            aria-expanded={isOpen}
          >
            <span>{item.title}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {isOpen && (
          <div className="mt-1 space-y-1">
            {item.items?.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'block rounded-md px-3 py-2 text-sm transition-colors',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
        !isActive && 'text-slate-700 dark:text-slate-300',
        level > 0 && 'ml-4'
      )}
    >
      {item.title}
    </Link>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const sidebarContent = (
    <nav className="space-y-6" aria-label="Documentation navigation">
      {docsNavigation.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <NavItemComponent key={itemIndex} item={item} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md dark:bg-slate-900 lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto bg-white p-6 shadow-xl transition-transform dark:bg-slate-900 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-slate-200 lg:bg-slate-50/50 lg:p-6 dark:lg:border-slate-800 dark:lg:bg-slate-900/50',
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
