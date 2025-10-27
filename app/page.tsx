'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedHeroSection } from "@/components/ui/animated-hero-section";

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden flex flex-col p-[9px]" style={{ backgroundColor: 'var(--home-background)' }}>
      {/* Main White Container */}
      <div className="relative bg-white rounded-[30px] shadow-[0px_0px_34px_0px_rgba(0,0,0,0.05)] flex-1 flex flex-col w-full">

        {/* Announcement Bar */}
        <div className="w-full hidden md:flex justify-center pt-3 pb-2 px-6">
          <div className="rounded-full px-6 py-2 w-full max-w-[1665px] bg-gradient-to-r from-[rgba(122,174,255,0.25)] via-[rgba(255,136,206,0.25)] to-[rgba(255,201,136,0.25)] flex justify-center">
            <p className="text-sm text-center" style={{ color: 'var(--home-primary-text)' }}>
              <span className="font-bold">SearchAF</span>
              <span className="font-medium"> now in early release access— Available for Shopify customers!  🎉</span>
            </p>
          </div>
        </div>

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

            {/* Right - Button + Menu */}
            <div className="flex items-center gap-4">
              <Button className="h-[52px] px-5 rounded-full border border-[rgba(5,35,51,0.13)] bg-white hover:bg-gray-50 text-[#052333] text-[15px] font-semibold">
                Get started for free
              </Button>
              <button className="w-[52px] h-[52px] rounded-full relative overflow-hidden flex items-center justify-center group">
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
                  <button className="w-[52px] h-[52px] rounded-full relative overflow-hidden flex items-center justify-center group">
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

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-0 pb-8">
          <AnimatedHeroSection
            heading="The easy answer bar for every question."
            description="Your customers don't search stores like they used to. Give them instant answers, not search results."
            button={
              <Button className="h-[64px] md:h-[84px] pl-3 md:pl-4 pr-6 md:pr-9 rounded-full bg-[#1A1A23] hover:bg-[#1A1A23]/90 text-white shadow-[0px_0px_22px_0px_rgba(0,0,0,0.09)] flex items-center gap-2 md:gap-3">
                <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] flex items-center justify-center">
                  <Image
                    src="/shopify-logo-color.svg"
                    alt="Shopify"
                    width={31}
                    height={38}
                    className="w-[25px] h-[30px] md:w-[31px] md:h-[38px]"
                  />
                </div>
                <span className="text-lg md:text-xl font-semibold">Add SearchAF to Shopify</span>
              </Button>
            }
            subtext={
              <span className="text-base font-medium" style={{ color: '#ADB4B7' }}>
                What is SearchAF? <Link href="/docs" className="underline transition-colors duration-200 ml-3 hover:text-[#1A1A23]">Read docs</Link>
              </span>
            }
          />
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
    </div>
  );
}
