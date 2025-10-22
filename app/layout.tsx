import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchAF - Product Search Built for the AI Era",
  description: "SearchAF delivers cutting-edge product search and discovery capabilities powered by AntflyDB",
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
