import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchAF - Answer Engine Built for the AI Era",
  description: "SearchAF delivers an answer engine with an answer bar to elevate the traditional search experience - more than search, it's answers. Powered by Antfly DB.",
  icons: {
    icon: "/af-logo.svg",
    shortcut: "/af-logo.svg",
    apple: "/af-logo.svg",
  },
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