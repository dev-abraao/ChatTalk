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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  
  if (!ablyKey) {
    console.error('Layout - NEXT_PUBLIC_ABLY_API_KEY is undefined');
  }

  return (
    <html lang="en" className={lobster.variable}>
      <body className={inter.className}>
        <AblyProvider ABLY_API_KEY={ablyKey}>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AblyProvider>
      </body>
    </html>
  );
}
