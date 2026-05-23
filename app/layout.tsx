import type { Metadata } from "next";
import { Bree_Serif, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import CopyrightBanner from "@/src/components/CopyrightBanner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
});

const bree = Bree_Serif({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TutorAI - Twój osobisty AI korepetytor | Naucz się mądrzej",
  description:
    "AI korepetytorzy, nagrania, quizy i graf wiedzy. Wrzuć materiał, a TutorAI przygotuje plan nauki.",
  keywords: ["AI tutor", "nauka", "edukacja", "graf wiedzy", "TutorAI"],
  openGraph: {
    title: "TutorAI - Twój osobisty AI korepetytor",
    description: "Personalizowane ścieżki nauki z AI, nagraniami i grafem wiedzy.",
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
    <html lang="pl" className={`${nunito.variable} ${bree.variable} antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <CopyrightBanner />
        </Providers>
      </body>
    </html>
  );
}
