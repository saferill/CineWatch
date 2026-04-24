import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Onboarding from "./components/Onboarding";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CineWatch — Watch Movies, Series & Anime",
  description:
    "Discover and watch movies, TV series, and anime instantly. Powered by TMDB & Anilist.",
  keywords: ["movies", "series", "anime", "streaming", "watch online"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#000000] text-foreground antialiased">
        <Onboarding />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
