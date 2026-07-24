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

export const metadata: Metadata = {
  title: "Sebastian Marin | Full-Stack Developer — Interfaces, APIs, Spatial Data & Automation",
  description: "Systems Engineer and Full-Stack Developer specializing in Next.js, React, TypeScript, PHP/cURL REST APIs, SQL, Leaflet spatial maps, Linux server automation, and Gemini AI features.",
  keywords: ["Sebastian Marin", "Full-Stack Developer", "Next.js", "TypeScript", "PHP", "REST API", "Geospatial", "Leaflet", "Bolivia", "Linux", "Docker", "Playwright"],
  authors: [{ name: "Sebastian Marin", url: "https://github.com/marinsebastian" }],
  openGraph: {
    title: "Sebastian Marin | Full-Stack Developer",
    description: "Operational web interfaces, spatial data visualizations, REST APIs, and automation systems.",
    type: "website",
    locale: "es_BO",
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
