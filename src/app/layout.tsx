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
  // Debug das variáveis de ambiente apenas no desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('ABLY_API_KEY available:', !!process.env.NEXT_PUBLIC_ABLY_API_KEY);
  }

  return (
    <html lang="en" className={lobster.variable}>
      <body className={inter.className}>
        <AblyProvider ABLY_API_KEY={process.env.NEXT_PUBLIC_ABLY_API_KEY}>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AblyProvider>
      </body>
    </html>
  );
}
