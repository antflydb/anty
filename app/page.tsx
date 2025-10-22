'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Announcement, AnnouncementTitle } from "@/components/ui/announcement";
import { Header } from "@/components/layout/header";
import { AnimatedHeroSection } from "@/components/ui/animated-hero-section";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-auto">
      {/* Header */}
      <Header />

      {/* Main content - centered vertically with more bottom spacing */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-24">
        {/* Announcement Bar */}
        <div className="w-full flex justify-center mb-24">
          <Announcement themed className="py-0 pl-2 pr-3">
            <Link href="https://antfly.io" target="_blank" rel="noopener noreferrer">
              <AnnouncementTitle className="text-muted-foreground hover:text-foreground transition-colors gap-2">
                <div className="rounded-full bg-gray-100 p-1.5">
                  <Image
                    src="/af-logo.svg"
                    alt="Antfly Logo"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </div>
                <span>Powered by antfly</span>
              </AnnouncementTitle>
            </Link>
          </Announcement>
        </div>

        {/* Hero Section */}
        <section className="container max-w-6xl">
          <AnimatedHeroSection
            heading="Build better search, designed for the AI era."
            description="Semantic search, vector embeddings, and traditional search in one unified platform. Built for AI from day one. Now available for Shopify, for free."
            button={
              <Button size="lg" className="rounded-lg font-bold bg-[#041D2B] hover:bg-[#9A94FF] text-white gap-2 px-10 text-lg h-[65px]">
                <span>Add SearchAF to</span>
                <Image
                  src="/shopify-logo-white.svg"
                  alt="Shopify"
                  width={114}
                  height={28}
                  className="h-7 ml-2 w-auto"
                />
              </Button>
            }
            subtext="Free & paid plans available. No credit card required."
          />
        </section>
      </div>
    </div>
  );
}
