import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anty v1.0",
  description: "Anty is an interactive AI companion built with Next.js and GSAP animations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
