'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Announcement, AnnouncementTitle } from "@/components/ui/announcement";
import { Header } from "@/components/layout/header";
import { AnimatedHeroSection } from "@/components/ui/animated-hero-section";
import { Search, Zap, Shield, Database, Code, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Announcement Bar - Below Header, Above H1 */}
      <div className="w-full flex justify-center pt-16 pb-1">
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
      <section className="container py-32">
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

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Why SearchAF?
          </h2>
          <p className="text-muted-foreground max-w-[42rem] mx-auto">
            Enterprise-grade search infrastructure with AI-powered capabilities
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-[1100px] mx-auto">
          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <Search className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Semantic search</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                AI-powered vector search that understands intent and context, not just keywords
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <Zap className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Lightning fast</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Sub-millisecond query performance with horizontal scalability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <Shield className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Enterprise ready</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Production-grade infrastructure with enterprise security and compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <Database className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Vector database</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Hybrid search combining traditional database features with vector search
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <Code className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Developer friendly</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                RESTful API with comprehensive SDKs and detailed documentation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="flex flex-col min-h-[225px]">
            <CardHeader className="px-8 py-4 flex-1 flex flex-col justify-between">
              <div>
                <TrendingUp className="h-6 w-6 mb-4 text-primary" />
                <CardTitle className="text-lg font-bold mb-2">Usage analytics</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Built-in analytics and monitoring for search performance insights
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-32">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 md:p-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg max-w-[42rem] mx-auto mb-10">
            Start building with SearchAF today. Check out our documentation and guides to begin.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="outline" asChild className="rounded-lg">
              <Link href="/docs">Read Docs</Link>
            </Button>
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/af-logo.svg"
                  alt="SearchAF Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="text-base logo-text">
                  <span style={{ fontWeight: 400 }}>search</span>
                  <span style={{ fontWeight: 700 }}>af</span>
                </span>
              </Link>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                    Getting started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api" className="text-muted-foreground hover:text-foreground">
                    API reference
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://antfly.io" className="text-muted-foreground hover:text-foreground">
                    About Antfly
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SearchAF. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
