'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { CommandPalette } from "@/components/ui/command-palette";
import { CenterNav } from "@/components/layout/center-nav";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Calendar, User, ArrowLeft } from "lucide-react";
import type { Post } from "@/lib/markdown";

interface BlogPostClientProps {
  post: Post;
}

export function BlogPostClient({ post }: BlogPostClientProps) {
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
    <div className="relative min-h-screen flex flex-col p-[9px]" style={{ backgroundColor: 'var(--home-background)' }}>
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

        {/* Blog Content */}
        <div className="flex-1 flex flex-col items-center px-6 pb-12">
          {/* Content Container - Max Width 1000px */}
          <div className="w-full max-w-[1000px]">
            {/* Content with proper top spacing */}
            <div className="flex flex-col gap-[45px] pt-[40px] md:pt-[60px] lg:pt-[80px]">

              {/* Back Button & Separator Section */}
              <div className="flex gap-[36px] items-center w-full">
                <Link href="/blog">
                  <button className="w-[52px] h-[52px] rounded-full bg-[rgba(238,238,243,0.41)] flex items-center justify-center group transition-colors hover:bg-[rgba(238,238,243,0.6)]">
                    <ArrowLeft
                      className="w-[28px] h-[28px] text-[#77777F] group-hover:-translate-x-0.5 transition-transform"
                      strokeWidth={2}
                    />
                  </button>
                </Link>
                <div className="flex-1 h-px bg-[rgba(0,0,0,0.1)]" />
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-[60px]">
                <h1 className="text-[40px] md:text-[60px] lg:text-[76px] font-bold leading-none text-[#1A1A23]" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                  {post.title}
                </h1>
              </div>

              {/* Description & Meta Section */}
              <div className="flex flex-col gap-[24px]">
                {/* Description */}
                {post.description && (
                  <p className="text-[20px] md:text-[24px] leading-[1.7] text-[#77777F]" style={{ fontFamily: 'SF Pro, sans-serif', fontWeight: 500 }}>
                    {post.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {post.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              <div
                className="w-full h-[300px] md:h-[400px] rounded-[45px]"
                style={{
                  backgroundImage: post.slug.charCodeAt(0) % 3 === 0
                    ? "linear-gradient(92.3483deg, rgba(116, 174, 255, 0.2) 1.1955%, rgba(255, 109, 250, 0.157) 101.41%, rgba(255, 199, 182, 0.19) 166.96%, rgba(255, 201, 94, 0.2) 201.18%, rgba(185, 64, 255, 0.2) 307.72%), linear-gradient(90deg, rgb(252, 246, 255) 0%, rgb(252, 246, 255) 100%)"
                    : post.slug.charCodeAt(0) % 3 === 1
                    ? "linear-gradient(-77.8169deg, rgba(116, 174, 255, 0.2) 107.42%, rgba(255, 109, 250, 0.157) 31.777%, rgba(255, 199, 182, 0.19) 17.702%, rgba(255, 201, 94, 0.2) 103.32%, rgba(185, 64, 255, 0.2) 123.96%), linear-gradient(90deg, rgb(252, 246, 255) 0%, rgb(252, 246, 255) 100%)"
                    : "linear-gradient(50.9431deg, rgba(116, 174, 255, 0.2) 34.665%, rgba(255, 109, 250, 0.157) 35.393%, rgba(255, 199, 182, 0.19) 81.221%, rgba(255, 201, 94, 0.2) 105.15%, rgba(185, 64, 255, 0.2) 179.63%), linear-gradient(90deg, rgb(252, 246, 255) 0%, rgb(252, 246, 255) 100%)"
                }}
              />

              {/* Markdown Content */}
              <div className="mb-16 md:mb-20">
                <MarkdownContent content={post.content} />
              </div>

              {/* Share Buttons */}
              <div className="pt-8 border-t border-border/30">
                <ShareButtons
                  title={post.title}
                  url={`https://searchaf.antfly.io/blog/${post.slug}`}
                />
              </div>
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
