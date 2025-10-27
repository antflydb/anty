'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {

  return (
    <div className="relative min-h-screen flex flex-col p-[9px]" style={{ backgroundColor: 'var(--home-background)' }}>
      {/* Main White Container */}
      <div className="relative bg-white rounded-[30px] shadow-[0px_0px_34px_0px_rgba(0,0,0,0.05)] flex-1 flex flex-col w-full">

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Form Container */}
          <div className="w-full max-w-[450px] flex flex-col gap-8">

            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2.5 justify-center mb-4">
              <Image
                src="/af-logo.svg"
                alt="SearchAF Logo"
                width={32}
                height={32}
                className="w-[32px] h-[32px]"
              />
              <span className="text-[24px] logo-text">
                <span style={{ fontWeight: 400 }}>search</span>
                <span style={{ fontWeight: 700 }}>af</span>
              </span>
            </Link>

            {/* Social Login Options */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-[52px] rounded-full border-[1.5px] border-[#ADB4B7]/30 bg-transparent hover:border-[#ADB4B7]/50 hover:bg-transparent text-[#1A1A23] font-semibold text-[15px]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-[52px] rounded-full border-[1.5px] border-[#ADB4B7]/30 bg-transparent hover:border-[#ADB4B7]/50 hover:bg-transparent text-[#1A1A23] font-semibold text-[15px]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#ADB4B7]/30" />
              <span className="text-[14px] text-[#77777F]">
                or
              </span>
              <div className="flex-1 h-[1px] bg-[#ADB4B7]/30" />
            </div>

            {/* Email Login Button */}
            <Button
              onClick={() => {
                // TODO: Navigate to email login form
                console.log('Log in with email clicked');
              }}
              className="h-[56px] rounded-full bg-[#1A1A23] hover:bg-[#1A1A23]/90 text-white font-semibold text-[16px]"
            >
              Log in with email
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className="text-[14px] text-[#77777F]">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-[#1A1A23] hover:text-[#77777F] transition-colors"
                >
                  Sign up
                </Link>
              </span>
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
    </div>
  );
}
