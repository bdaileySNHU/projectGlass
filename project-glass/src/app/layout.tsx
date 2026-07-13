import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "photos.bdailey.com",
  description: "Travel and vacation photography by Bryan Dailey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const hasUmami = umamiSrc && umamiWebsiteId;

  return (
    <html lang="en">
      <head>
        {hasUmami && (
          <Script
            src={umamiSrc}
            data-website-id={umamiWebsiteId}
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
