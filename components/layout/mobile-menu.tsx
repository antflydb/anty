'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Mobile search:', searchValue);
      // TODO: Implement search functionality
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "md:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors",
          className
        )}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Menu Overlay and Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 w-full max-w-sm h-screen bg-background border-l shadow-xl md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content - Takes remaining space */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6 space-y-6">
                  {/* Search Bar */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Search</label>
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Ask anything"
                        className="w-full h-12 pl-4 pr-12 rounded-lg bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="submit"
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full transition-colors",
                          searchValue.trim()
                            ? "bg-[#041D2B] hover:bg-[#9A94FF] text-white"
                            : "bg-transparent text-muted-foreground"
                        )}
                      >
                        {searchValue.trim() ? (
                          <ArrowRight className="h-4 w-4" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Resources
                    </div>
                    <Link
                      href="/guides"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      Guides
                    </Link>
                    <Link
                      href="/blog"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/docs"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      Docs
                    </Link>
                    <div className="my-2 border-t border-border/40"></div>
                    <Link
                      href="/support"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      Support
                    </Link>
                  </div>

                  {/* Sign In */}
                  <div className="pt-4 border-t">
                    <Link
                      href="/signin"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-center"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>

                {/* Get Started Button - Fixed at bottom */}
                <div className="p-6 border-t bg-background">
                  <Button asChild className="w-full rounded-lg font-medium bg-[#041D2B] hover:bg-[#9A94FF] text-white h-12 text-base">
                    <Link href="/signup" onClick={handleLinkClick}>
                      Get started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
