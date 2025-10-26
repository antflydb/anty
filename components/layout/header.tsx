'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isLogoDropdownOpen, setIsLogoDropdownOpen] = useState(false);
  const [opticalMargin, setOpticalMargin] = useState(60);

  const logoRef = useRef<HTMLDivElement>(null);
  const rightNavRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateOpticalMargin = () => {
      if (!logoRef.current || !rightNavRef.current || !searchBarRef.current) return;

      const logoWidth = logoRef.current.offsetWidth;
      const searchBarRect = searchBarRef.current.getBoundingClientRect();
      const rightNavRect = rightNavRef.current.getBoundingClientRect();

      // Calculate the space from the right edge of search bar to the right edge of the nav
      const rightSpace = rightNavRect.right - searchBarRect.right;

      // Optical margin = right space - logo width (plus a base margin)
      const calculatedMargin = Math.max(60, rightSpace - logoWidth);
      setOpticalMargin(calculatedMargin);
    };

    // Calculate on mount and after layout
    calculateOpticalMargin();

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateOpticalMargin);
    if (logoRef.current) resizeObserver.observe(logoRef.current);
    if (rightNavRef.current) resizeObserver.observe(rightNavRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        {/* Logo - Far Left with Dropdown */}
        <div ref={logoRef} className="relative">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src="/af-logo.svg"
              alt="SearchAF Logo"
              width={28}
              height={28}
              className="h-6 w-6 md:h-7 md:w-7"
            />
            <span className="text-lg md:text-xl logo-text relative" style={{ top: '-2px' }}>
              <span style={{ fontWeight: 400 }}>search</span>
              <span style={{ fontWeight: 700 }}>af</span>
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-colors duration-150 text-foreground/50 hover:text-foreground hidden",
              isLogoDropdownOpen && "text-foreground"
            )} style={{ position: 'relative', top: '-2px' }} />
          </Link>

          <AnimatePresence>
            {isLogoDropdownOpen && (
              <>
                {/* Invisible bridge to prevent dropdown from closing */}
                <div
                  className="absolute left-0 top-7 h-4 w-64 pointer-events-auto"
                  onMouseEnter={() => setIsLogoDropdownOpen(true)}
                  onMouseLeave={() => setIsLogoDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onMouseEnter={() => setIsLogoDropdownOpen(true)}
                  onMouseLeave={() => setIsLogoDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg"
                >
                  <div className="p-2">
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    <div className="font-medium text-sm">SearchAF</div>
                    <div className="text-xs text-muted-foreground">AI-powered product search</div>
                  </Link>
                  <Link
                    href="https://antfly.io"
                    className="block px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    <div className="font-medium text-sm">Antfly</div>
                    <div className="text-xs text-muted-foreground">Vector database platform</div>
                  </Link>
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav ref={rightNavRef} className="hidden md:flex items-center gap-6 flex-1">
          {/* Search Button */}
          <SearchBar ref={searchBarRef} opticalMargin={opticalMargin} />

          {/* Resources Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
              className={cn(
                "flex items-center gap-1 h-10 text-sm font-medium text-foreground transition-colors rounded-full hover:bg-muted px-3",
                isResourcesOpen && "bg-muted"
              )}
            >
              Resources
              <ChevronDown className={cn(
                "h-4 w-4 transition-colors duration-150 opacity-50",
                isResourcesOpen && "opacity-100 text-foreground"
              )} />
            </button>

            <AnimatePresence>
              {isResourcesOpen && (
                <>
                  {/* Invisible bridge to prevent dropdown from closing */}
                  <div
                    className="absolute -left-3 top-10 h-3 w-36 pointer-events-auto"
                    onMouseEnter={() => setIsResourcesOpen(true)}
                    onMouseLeave={() => setIsResourcesOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onMouseEnter={() => setIsResourcesOpen(true)}
                    onMouseLeave={() => setIsResourcesOpen(false)}
                    className="absolute -left-3 mt-2 w-36 rounded-lg border bg-popover shadow-lg"
                  >
                    <div className="p-2">
                    <Link
                      href="/guides"
                      className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left"
                    >
                      Guides
                    </Link>
                    <Link
                      href="/blog"
                      className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/docs"
                      className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left"
                    >
                      Docs
                    </Link>
                    <div className="my-1 border-t border-border/40"></div>
                    <Link
                      href="/support"
                      className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-left"
                    >
                      Support
                    </Link>
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Sign In */}
          <Link
            href="/signin"
            className="text-sm font-medium text-foreground hover:text-foreground/60 transition-colors"
          >
            Sign in
          </Link>

          {/* Get Started Button */}
          <Button asChild className="rounded-lg gap-0 font-medium bg-[#041D2B] text-white border-0 p-0 overflow-hidden">
            <motion.a
              href="/signup"
              className="flex items-center px-4 h-10"
              initial="idle"
              whileHover="hover"
              variants={{
                idle: { backgroundColor: '#041D2B' },
                hover: { backgroundColor: '#9A94FF' }
              }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span>Get started</span>
              <motion.div
                className="overflow-hidden flex items-center"
                variants={{
                  idle: { width: 0, opacity: 0 },
                  hover: { width: 'auto', opacity: 1 }
                }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div
                  className="flex items-center ml-3"
                  variants={{
                    idle: { x: -8 },
                    hover: { x: 0 }
                  }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </motion.div>
              </motion.div>
            </motion.a>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <MobileMenu />
      </div>
    </header>
  );
}
