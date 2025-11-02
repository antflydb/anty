'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { docsNavigation, type NavItem } from '@/config/docs-navigation'
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  className?: string
}

interface NavItemProps {
  item: NavItem
  level?: number
  openApiGroupId?: string | null
  onApiGroupToggle?: (groupId: string | null) => void
  parentTitle?: string
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  POST: 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  PUT: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
}

function MethodBadgeSmall({ method }: { method: string }) {
  const colorClass = methodColors[method.toUpperCase()] || methodColors.GET
  return (
    <Badge className={cn('font-mono font-semibold text-[10px] px-1.5 py-0', colorClass)}>
      {method.toUpperCase()}
    </Badge>
  )
}

function NavItemComponent({ item, level = 0, openApiGroupId, onApiGroupToggle, parentTitle }: NavItemProps) {
  const pathname = usePathname()
  const router = useRouter()
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href === pathname

  // Check if this is an API tag group (has children with methods)
  const isApiTagGroup = parentTitle === 'API Documentation' && hasChildren && item.items?.some(child => child.method)

  // Determine if this group should be open
  const shouldBeOpen = isApiTagGroup ? openApiGroupId === item.title : true
  const [isOpen, setIsOpen] = useState(shouldBeOpen)

  // Update isOpen when openApiGroupId changes
  useEffect(() => {
    if (isApiTagGroup) {
      setIsOpen(openApiGroupId === item.title)
    }
  }, [openApiGroupId, isApiTagGroup, item.title])

  // Handle click on API tag group
  const handleApiTagClick = (e: React.MouseEvent) => {
    if (isApiTagGroup && item.href) {
      e.preventDefault()
      // Toggle this group (or open it if it's closed)
      const newOpenId = openApiGroupId === item.title ? null : item.title
      onApiGroupToggle?.(newOpenId)
      // Navigate to the tag page
      router.push(item.href)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isApiTagGroup) {
      const newOpenId = isOpen ? null : item.title
      onApiGroupToggle?.(newOpenId)
    } else {
      setIsOpen(!isOpen)
    }
  }

  if (hasChildren) {
    return (
      <div>
        {item.href ? (
          <Link
            href={item.href}
            onClick={handleApiTagClick}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
              !isActive && 'text-slate-700 dark:text-slate-300',
              level > 0 && 'ml-4'
            )}
          >
            <span>{item.title}</span>
            {!isApiTagGroup && (
              <button
                onClick={handleToggle}
                className="ml-2"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </Link>
        ) : (
          <button
            onClick={handleToggle}
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
              <NavItemComponent
                key={index}
                item={child}
                level={level + 1}
                openApiGroupId={openApiGroupId}
                onApiGroupToggle={onApiGroupToggle}
                parentTitle={item.title}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Leaf item - show with method badge if it has a method
  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50',
        !isActive && 'text-slate-700 dark:text-slate-300',
        level > 0 && 'ml-4'
      )}
    >
      <span className="truncate">{item.title}</span>
      {item.method && <MethodBadgeSmall method={item.method} />}
    </Link>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openApiGroupId, setOpenApiGroupId] = useState<string | null>(null)

  const sidebarContent = (
    <nav className="space-y-6" aria-label="Documentation navigation">
      {docsNavigation.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <NavItemComponent
                key={itemIndex}
                item={item}
                openApiGroupId={openApiGroupId}
                onApiGroupToggle={setOpenApiGroupId}
              />
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
