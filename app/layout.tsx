import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchAF - Answer Engine Built for the AI Era",
  description: "SearchAF delivers an answer engine with an answer bar to elevate the traditional search experience - more than search, it's answers. Powered by Antfly DB.",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}