import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Archivo } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScroll from "@/components/layout/SmoothScroll";
import PageTransition from "@/components/layout/PageTransition";
import Navigation from "@/components/layout/Navigation";
import BackToTop from "@/components/layout/BackToTop";
import CustomCursor from "@/components/cursor/CustomCursor";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { title: `${site.name} — ${site.role}`, description: site.description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#05060d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} ${archivo.variable}`}>
      <body>
        <div className="aurora" aria-hidden />
        <a href="#main" className="skip-link">Skip to content</a>
        <SmoothScroll>
          <PageTransition chrome={<><Navigation /><BackToTop /></>}>{children}</PageTransition>
        </SmoothScroll>
        <CustomCursor />
      </body>
    </html>
  );
}
