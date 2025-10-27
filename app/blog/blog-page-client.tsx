'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { CommandPalette } from "@/components/ui/command-palette";
import { Calendar, User } from "lucide-react";
import type { Post } from "@/lib/markdown";

interface BlogPageClientProps {
  posts: Post[];
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // Prevent default browser search
        setIsCommandPaletteOpen(true);
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
              <Button variant="outline" className="h-[52px] px-4 rounded-full border-[1.5px] border-[#ADB4B7]/30 bg-transparent hover:border-[#ADB4B7]/50 text-[#1A1A23] font-semibold text-sm transition-all">
                Get started for free
              </Button>
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
              <div
                className="flex items-center justify-between bg-white rounded-full pl-6 pr-2 py-2 w-[356px] center-nav-hover"
                style={{
                  border: '1px solid rgba(227, 220, 220, 0.53)',
                  boxShadow: '0 5.635px 21.287px 0 rgba(0, 0, 0, 0.03), 0 2.993px 11.305px 0 rgba(0, 0, 0, 0.02), 0 1.245px 4.704px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <Image
                    src="/af-logo.svg"
                    alt="SearchAF Logo"
                    width={27.55}
                    height={27.55}
                    className="w-[27.55px] h-[27.55px]"
                  />
                  <span className="text-[20px] logo-text relative" style={{ top: '-1px', width: '96px', display: 'inline-block' }}>
                    <span style={{ fontWeight: 400 }}>search</span>
                    <span style={{ fontWeight: 700 }}>af</span>
                  </span>
                </div>

                {/* CMD+K Shortcut */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium" style={{ color: '#ADB4B7' }}>
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                  <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="w-[52px] h-[52px] rounded-full relative overflow-hidden flex items-center justify-center group">
                    {/* Base gradient */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#EAF1FF] to-[#FAEDFE] transition-opacity duration-300 ease-in-out" />
                    {/* Hover gradient */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C2D9FC] to-[#F7CCFA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
                    <Image
                      src="/menu1.svg"
                      alt="Menu"
                      width={34}
                      height={34}
                      className="w-[34px] h-[34px] relative z-10"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Get Started Button */}
            <div className="flex-1 flex justify-end">
              <Button className="h-[61px] px-5 rounded-full bg-[#1A1A23] hover:bg-[#1A1A23]/90 text-white font-semibold">
                Get started for free
              </Button>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="flex-1 px-6 pb-12">
          {/* Hero Section */}
          <div className="py-16 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-[42rem]">
              Latest updates, insights, and best practices from the SearchAF team
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="pb-12">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 p-0">
                      {/* Featured Image */}
                      {post.image && (
                        <div className="relative w-full h-48 overflow-hidden bg-muted">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <CardHeader className="pb-4 pt-6">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-base line-clamp-3 leading-relaxed">
                          {post.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {post.date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                          {post.author && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span>{post.author}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
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
              className="h-4 w-4 opacity-60"
              style={{ filter: 'grayscale(100%) brightness(1.2)' }}
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
