import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dev-portfolio-lilac-chi.vercel.app";

// The page ships in Spanish by default, so the shared preview is Spanish too.
const SITE_TITLE = "Sebastian Marin | Desarrollador Full-Stack — Interfaces, APIs, Datos Espaciales y Automatización";
const SITE_DESCRIPTION =
  "Ingeniero de Sistemas y desarrollador Full-Stack. Construyo interfaces web, APIs REST en Next.js y PHP, mapas vectoriales con MapLibre GL y PMTiles, y automatización en Linux.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ["Sebastian Marin", "Full-Stack Developer", "Next.js", "TypeScript", "PHP", "REST API", "Geospatial", "MapLibre GL", "PMTiles", "Bolivia", "Linux", "Docker", "Playwright"],
  authors: [{ name: "Sebastian Marin", url: "https://github.com/marinsebastian" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Sebastian Marin — Portafolio de Ingeniería",
    type: "website",
    locale: "es_BO",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="bg-[#0b0f17] text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
