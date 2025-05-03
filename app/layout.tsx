import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentTube",
  description: "Revolutionize your YouTube workflow with our AI content analysis platform.  From automatic transcriptions and AI-powered thumbnail generation to viral shot scripting and interactive AI agent assistance, we help you create compelling content faster and smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientWrapper>
          <Header />
          <link rel="icon" href="/public/icon.png" sizes="any" />
          {children}
          <Toaster position="bottom-center" />
        </ClientWrapper>
      </body>
    </html>
  );
}
