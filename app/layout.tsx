import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "TutorAI - Twój osobisty AI tutor edukacyjny | Naucz się mądrzej",
  description:
    "Personalizowane ścieżki nauki, AI wsparcie i graf wiedzy. Zacznij bezpłatnie bez karty kredytowej.",
  keywords: ["AI tutor", "nauka", "edukacja", "graf wiedzy", "TutorAI"],
  openGraph: {
    title: "TutorAI - Twój osobisty AI tutor",
    description: "Personalizowane ścieżki nauki z AI i grafem wiedzy.",
    type: "website",
    locale: "pl_PL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
