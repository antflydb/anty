'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { CommandPalette } from "@/components/ui/command-palette";
import { CenterNav } from "@/components/layout/center-nav";

export default function TeamPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev); // Toggle instead of just opening
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden flex flex-col p-[9px]" style={{ backgroundColor: 'var(--home-background)' }}>
      {/* Main White Container */}
      <div className="relative bg-white rounded-[30px] shadow-[0px_0px_34px_0px_rgba(0,0,0,0.05)] flex-1 flex flex-col w-full">

        {/* Navigation Row */}
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          {/* Mobile Navigation - visible on small screens */}
          <div className="flex md:hidden items-center justify-between w-full">
            {/* Left - Logo */}
            <div className="flex items-center gap-2.5">
              <Image
                src="/af-logo.svg"
                alt="SearchAF Logo"
                width={32}
                height={32}
                className="w-[32px] h-[32px]"
              />
              <span className="text-[22px] logo-text">
                <span style={{ fontWeight: 400 }}>search</span>
                <span style={{ fontWeight: 700 }}>af</span>
              </span>
            </div>

            {/* Right - Get Started Button + Hamburger */}
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <Button variant="outline" className="h-[52px] px-4 rounded-full border-[1.5px] border-[#ADB4B7]/30 bg-transparent hover:border-[#ADB4B7]/50 text-[#1A1A23] font-semibold text-sm transition-all">
                  Get started for free
                </Button>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-[52px] h-[52px] rounded-full relative overflow-hidden flex items-center justify-center group"
              >
                {/* Base gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#EAF1FF] to-[#FAEDFE] transition-opacity duration-300 ease-in-out" />
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C2D9FC] to-[#F7CCFA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
                <Image
                  src="/menu1.svg"
                  alt="Menu"
                  width={32}
                  height={32}
                  className="w-[32px] h-[32px] relative z-10"
                />
              </button>
            </div>
          </div>

          {/* Desktop Navigation - visible on medium+ screens */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left Spacer */}
            <div className="flex-1" />

            {/* Centered Menu Bar */}
            <div className="flex items-center justify-center flex-1">
              <CenterNav onMenuClick={() => setIsCommandPaletteOpen(true)} />
            </div>

            {/* Right - Get Started Button */}
            <div className="flex-1 flex justify-end">
              <Link href="/signup">
                <Button className="h-[61px] px-5 rounded-full bg-[#1A1A23] hover:bg-[#1A1A23]/90 text-white font-semibold">
                  Get started for free
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="flex flex-col items-center text-center max-w-[588px]">
            {/* Anty Character Image */}
            <div className="mb-12">
              <Image
                src="/anty-a.png"
                alt="Anty Character"
                width={302}
                height={203}
                className="w-[302px] h-[203px]"
              />
            </div>

            {/* Description Text */}
            <p className="text-[16px] leading-[1.7] text-[#77777F] mb-16" style={{ fontFamily: 'SF Pro, sans-serif', fontWeight: 500 }}>
              SearchAF is built by engineers, designers, and data scientists with decades of experience building search infrastructure and software at scale. We saw the gap between how people ask questions now and how traditional search actually works. So we fixed it.
            </p>

            {/* Contact Section */}
            <div className="flex flex-col gap-[6px] items-center">
              <a
                href="mailto:teamaf@searchaf.com"
                className="text-[24px] font-semibold leading-[1.7] text-[#1A1A23] no-underline hover:text-[#77777F] hover:underline transition-colors"
                style={{ fontFamily: 'SF Pro, sans-serif' }}
              >
                teamaf@searchaf.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - OUTSIDE white container, on gray background */}
      <div className="flex items-center justify-center md:justify-between px-[18px] py-4 w-full">
        {/* Left - answers by antfly */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image
              src="/af-logo.svg"
              alt="Antfly Logo"
              width={16}
              height={16}
              className="h-4 w-4"
              style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(6%) saturate(336%) hue-rotate(169deg) brightness(89%) contrast(87%)' }}
            />
          </div>
          <span className="text-sm font-medium text-[#ADB4B7]">
            answers by <Link href="https://antfly.io" target="_blank" className="transition-colors duration-200 hover:text-[#1A1A23]">antfly</Link>
          </span>
        </div>

        {/* Right - Social Icons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-9">
          <Link href="https://twitter.com" target="_blank" className="text-[#ADB4B7] transition-colors duration-200 hover:text-[#1A1A23]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="text-[#ADB4B7] transition-colors duration-200 hover:text-[#1A1A23]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Desktop Command Palette */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
}
