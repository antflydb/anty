'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X, Home, BookMarked, LayoutGrid, Pyramid, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Search query:', searchQuery);
      onClose();
    }
  };

  // High-energy stagger animation variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 24,
        stiffness: 300,
        mass: 1.2,
      },
    },
  };

  // First button variant
  const button1Variants = {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 35,
        stiffness: 300,
        mass: 1.2,
        delay: 0.15,
      },
    },
  };

  // Second button variant
  const button2Variants = {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 35,
        stiffness: 300,
        mass: 1.2,
        delay: 0.28,
      },
    },
  };

  // Shopify variant - chained after button 2
  const shopifyVariants = {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 35,
        stiffness: 300,
        mass: 1.2,
        delay: 0.41,
      },
    },
  };

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
            className="fixed inset-0 z-50 bg-[rgba(21,21,22,0.72)] backdrop-blur-[10px]"
            onClick={onClose}
          />

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-[9px] z-50 bg-[rgba(14,14,15,0.83)] rounded-[30px] overflow-y-auto px-[20px] pt-[16px] pb-[24px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stagger animation container */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col flex-1"
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-[24px] pl-[8px]">
              {/* Logo */}
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <Image
                  src="/af-logo.svg"
                  alt="SearchAF Logo"
                  width={28}
                  height={28}
                  className="w-[28px] h-[28px] brightness-0 invert"
                />
              </Link>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-[16px] h-[16px] text-white" strokeWidth={3.3} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-[24px]">
              <div className="relative rounded-[16px] p-[1.5px] bg-gradient-to-r from-[rgba(116,174,255,0.95)] via-[rgba(177,136,249,0.95)] via-[rgba(255,136,206,0.95)] to-[rgba(255,201,136,0.95)]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full h-[56px] bg-[rgba(14,14,15,0.75)] focus:bg-[rgba(14,14,15,0.55)] px-[20px] rounded-[14.5px] text-[#FFFFFF] text-[17px] font-medium placeholder:text-white/40 focus:outline-none transition-colors duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleSearch}
                      className="absolute right-[16px] w-[36px] h-[36px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ArrowUp className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="mt-[24px] mb-[32px] px-[8px] space-y-[28px]">
              <motion.div variants={itemVariants}>
                <Link
                  href="/"
                  className="flex items-center gap-[14px] text-white hover:text-white/80 transition-colors"
                  onClick={onClose}
                >
                  <Home className="w-[20px] h-[20px]" strokeWidth={2} />
                  <span className="text-[17px] font-semibold tracking-[0.3px]">
                    Home
                  </span>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href="/docs"
                  className="flex items-center gap-[14px] text-white hover:text-white/80 transition-colors"
                  onClick={onClose}
                >
                  <BookMarked className="w-[20px] h-[20px]" strokeWidth={2} />
                  <span className="text-[17px] font-semibold tracking-[0.3px]">
                    Docs
                  </span>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href="/blog"
                  className="flex items-center gap-[14px] text-white hover:text-white/80 transition-colors"
                  onClick={onClose}
                >
                  <LayoutGrid className="w-[20px] h-[20px]" strokeWidth={2} />
                  <span className="text-[17px] font-semibold tracking-[0.3px]">
                    Blog
                  </span>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href="/team"
                  className="flex items-center gap-[14px] text-white hover:text-white/80 transition-colors"
                  onClick={onClose}
                >
                  <Pyramid className="w-[20px] h-[20px]" strokeWidth={2} />
                  <span className="text-[17px] font-semibold tracking-[0.3px]">
                    Team
                  </span>
                </Link>
              </motion.div>
            </nav>

            {/* CTA Buttons */}
            <div className="space-y-[10px] mb-[28px]">
              <motion.div variants={button1Variants}>
                <Link href="/signup" onClick={onClose} className="block">
                  <Button
                    className="w-full h-[56px] rounded-[44px] bg-[#4c4c56] hover:bg-[#4c4c56]/90 text-white font-semibold text-[17px] tracking-[0.3px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.09)]"
                  >
                    Get started for free
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={button2Variants}>
                <Link href="/login" onClick={onClose} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-[56px] rounded-[44px] border-[1.5px] border-[#4c4c56] bg-transparent hover:bg-[#4c4c56]/20 text-white hover:text-white font-semibold text-[17px] tracking-[0.3px]"
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Shopify Integration */}
            <motion.div variants={shopifyVariants} className="px-[8px] pt-[20px] pb-[20px] mb-auto">
              <Link
                href="#"
                className="flex items-center gap-[14px] hover:opacity-80 transition-opacity"
                onClick={onClose}
              >
                <div className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center">
                  <Image
                    src="/shopify-logo-color.svg"
                    alt="Shopify"
                    width={17}
                    height={20}
                    className="w-[17px] h-[20px]"
                  />
                </div>
                <span className="text-white font-semibold text-[16px] tracking-[0.3px]">
                  Add SearchAF to Shopify
                </span>
              </Link>
            </motion.div>
            </motion.div>

            {/* Separator */}
            <div className="w-full h-[1px] bg-white/20 mb-[20px]" />

            {/* Social Icons */}
            <div className="flex items-center gap-[28px] px-[8px] mb-[20px] opacity-50">
              <Link href="https://twitter.com" target="_blank" className="hover:opacity-70 transition-opacity">
                <svg className="w-[20px] h-[21px]" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>

              <Link href="https://linkedin.com" target="_blank" className="hover:opacity-70 transition-opacity">
                <svg className="w-[22px] h-[22px]" fill="white" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-[4px] text-[12px] font-medium text-white/46">
              <span>SearchAF by Antfly</span>
              <div className="flex items-center gap-[24px]">
                <Link href="/terms" className="hover:text-white/70 transition-colors" onClick={onClose}>
                  Use Terms
                </Link>
                <Link href="/privacy" className="hover:text-white/70 transition-colors" onClick={onClose}>
                  Privacy
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
