'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react';
import { X, Home, BookMarked, LayoutGrid, Pyramid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const systemFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const [searchQuery, setSearchQuery] = useState('');

  // Handle navigation and close
  const handleNavigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  // Handle search submission
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Search query:', searchQuery);
      onClose();
    }
  }, [searchQuery, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Auto-focus search input when opened and reset query
  useEffect(() => {
    if (isOpen) {
      const searchInput = document.getElementById('command-search');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[rgba(21,21,22,0.77)] backdrop-blur-[10px]"
            onClick={onClose}
          />

          {/* Container Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col gap-[11px] w-[706px] pointer-events-auto">
              {/* Search Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-[rgba(14,14,15,0.83)] rounded-[26.54px] px-[25.684px] py-[19.691px] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-[24px]">
                  {/* Logo */}
                  <Image
                    src="/af-logo.svg"
                    alt="SearchAF Logo"
                    width={32}
                    height={32}
                    className="w-[32px] h-[32px] brightness-0 invert pl-[8px]"
                  />

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="w-[41px] h-[41px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-[17px] h-[17px] text-white" strokeWidth={3.3} />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative rounded-[16px] p-[1.5px] bg-gradient-to-r from-[rgba(116,174,255,0.95)] via-[rgba(177,136,249,0.95)] via-[rgba(255,136,206,0.95)] to-[rgba(255,201,136,0.95)]">
                  <div className="relative bg-[rgba(14,14,15,0.75)] focus-within:bg-[rgba(14,14,15,0.55)] transition-colors duration-200 rounded-[14.5px] flex items-center px-[28px] h-[65px]">
                    <input
                      id="command-search"
                      type="text"
                      placeholder="Search docs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="flex-1 bg-transparent text-[#FFFFFF] text-[20px] font-medium placeholder:text-white/40 focus:outline-none"
                      style={{ fontFamily: systemFont }}
                    />
                    {searchQuery && (
                      <button
                        onClick={handleSearch}
                        className="ml-2 w-[40px] h-[40px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <ArrowRight className="w-[20px] h-[20px] text-white" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Navigation Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 } }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } }}
                className="bg-[rgba(14,14,15,0.83)] rounded-[26.54px] px-[25.684px] py-[19.691px] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between">
                  {/* Left Section - Navigation */}
                  <div className="px-[16px] py-[24px] space-y-[6px]">
                    <button
                      onClick={() => handleNavigate('/')}
                      className="flex items-center gap-[16px] text-white hover:bg-white/10 hover:text-white transition-all w-[250px] rounded-lg px-3 py-3"
                    >
                      <Home className="w-[20px] h-[20px]" strokeWidth={2} />
                      <span className="text-[18px] font-semibold tracking-[0.4px]" style={{ fontFamily: systemFont }}>
                        Home
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/docs')}
                      className="flex items-center gap-[16px] text-white hover:bg-white/10 hover:text-white transition-all w-[250px] rounded-lg px-3 py-3"
                    >
                      <BookMarked className="w-[20px] h-[20px]" strokeWidth={2} />
                      <span className="text-[18px] font-semibold tracking-[0.4px]" style={{ fontFamily: systemFont }}>
                        Docs
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/blog')}
                      className="flex items-center gap-[16px] text-white hover:bg-white/10 hover:text-white transition-all w-[250px] rounded-lg px-3 py-3"
                    >
                      <LayoutGrid className="w-[20px] h-[20px]" strokeWidth={2} />
                      <span className="text-[18px] font-semibold tracking-[0.4px]" style={{ fontFamily: systemFont }}>
                        Blog
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/team')}
                      className="flex items-center gap-[16px] text-white hover:bg-white/10 hover:text-white transition-all w-[250px] rounded-lg px-3 py-3"
                    >
                      <Pyramid className="w-[20px] h-[20px]" strokeWidth={2} />
                      <span className="text-[18px] font-semibold tracking-[0.4px]" style={{ fontFamily: systemFont }}>
                        Team
                      </span>
                    </button>
                  </div>

                  {/* Right Section - CTAs */}
                  <div className="py-[20px] space-y-[16px]">
                    <Button
                      className="w-full h-[64px] rounded-[44px] bg-[#4c4c56] hover:bg-[#5c5c66] text-white font-semibold text-[18px] tracking-[0.4px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.09)] transition-all"
                      style={{ fontFamily: systemFont }}
                      onClick={onClose}
                    >
                      Get started for free
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-[56px] rounded-[44px] border-[1.5px] border-[#4c4c56] bg-transparent hover:bg-[#4c4c56]/30 text-white hover:text-white font-semibold text-[18px] tracking-[0.4px] transition-all"
                      style={{ fontFamily: systemFont }}
                      onClick={onClose}
                    >
                      Log in
                    </Button>
                  </div>
                </div>

                {/* Shopify Integration */}
                <div className="pt-[40px] pb-0">
                  <div className="px-[8px] pb-[16px]">
                    <Link
                      href="#"
                      className="flex items-center gap-[17px] group transition-all"
                      onClick={onClose}
                    >
                      <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center">
                        <Image
                          src="/shopify-logo-color.svg"
                          alt="Shopify"
                          width={19}
                          height={24}
                          className="w-[19px] h-[24px]"
                        />
                      </div>
                      <span className="text-white font-semibold text-[16px] tracking-[0.36px] group-hover:opacity-70 transition-opacity" style={{ fontFamily: systemFont }}>
                        Add SearchAF to Shopify
                      </span>
                    </Link>
                  </div>

                  {/* Separator */}
                  <div className="w-full h-[1px] bg-white/20 my-[24px]" />

                  {/* Footer */}
                  <div className="flex items-center justify-between px-[16px]">
                    <div className="flex items-center gap-[35px]">
                      <span className="text-[13.4px] font-medium text-white/46" style={{ fontFamily: systemFont }}>
                        SearchAF by Antfly
                      </span>

                      {/* Social Icons */}
                      <div className="flex items-center gap-[20px] opacity-50">
                        <Link href="https://twitter.com" target="_blank" className="hover:opacity-70 transition-opacity">
                          <svg className="w-[15px] h-[15px]" fill="white" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </Link>

                        <Link href="https://linkedin.com" target="_blank" className="hover:opacity-70 transition-opacity">
                          <svg className="w-[16px] h-[16px]" fill="white" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-[38px]">
                      <Link href="/terms" className="text-[13.4px] font-medium text-white/46 hover:text-white/70 transition-colors" onClick={onClose} style={{ fontFamily: systemFont }}>
                        Use Terms
                      </Link>
                      <Link href="/privacy" className="text-[13.4px] font-medium text-white/46 hover:text-white/70 transition-colors" onClick={onClose} style={{ fontFamily: systemFont }}>
                        Privacy
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}