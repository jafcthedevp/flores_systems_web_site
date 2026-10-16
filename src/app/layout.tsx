import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./landing.css";
import "./ui.css";
const font = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Flores Systems — Sitios web y sistemas para tu negocio",
    template: "%s | Flores Systems",
  },
  description: site.description,
  icons: { icon: "/img/flores-sys3_nobg.png" },
  openGraph: {
    title: "Flores Systems",
    description: site.description,
    locale: "es_PE",
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={font.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
