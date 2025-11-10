import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/custom/header";
import Footer from "@/components/custom/footer";

const InterSans = Inter({
  variable: "--font-Inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha Archives",
  description: " Learn How to Print With Crypto & Memecoins By Launching Your Own Memecoins, Finding 100x Weekly Callouts & Even Becoming a Crypto Influencer!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InterSans.className} antialiased bg-neutral-900 text-white`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
