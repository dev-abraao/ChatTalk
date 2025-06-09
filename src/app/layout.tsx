import type { Metadata } from "next";
import { Inter, Lobster } from "next/font/google";
import { AblyProvider } from "./contexts/AblyContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const lobster = Lobster({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lobster",
  weight: "400",
});

export const metadata: Metadata = {
  title: "ChatTalk",
  description: "Um chat para conversar com seus amigos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ablyKey = 'NhJcoA.Nyx0fQ:GYtfcRdXXu-_DEno3r8dS8rJBl_ojYaSTVLSfYtaV3U';
  
  if (!ablyKey) {
    console.error('Layout - NEXT_PUBLIC_ABLY_API_KEY is undefined');
  }

  return (
    <html lang="en" className={lobster.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
      </head>
      <body className={inter.className}>
        <AblyProvider ABLY_API_KEY={ablyKey || undefined}>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AblyProvider>
      </body>
    </html>
  );
}
