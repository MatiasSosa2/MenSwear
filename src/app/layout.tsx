import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingCart from "@/components/FloatingCart";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MENSWEAR | Moda masculina de alta gama",
    template: "%s | MENSWEAR",
  },
  description:
    "E-commerce minimalista y moderno de moda masculina premium. Inspirado en Mcowens.com, optimizado para Argentina.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "MENSWEAR",
    description:
      "E-commerce minimalista y moderno de moda masculina premium.",
    type: "website",
    locale: "es_AR",
    siteName: "MENSWEAR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Acelera handshake al CDN del SDK de Mercado Pago */}
        <link rel="dns-prefetch" href="https://sdk.mercadopago.com" />
        <link rel="preconnect" href="https://sdk.mercadopago.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        {/* Carga temprana del SDK para minimizar latencia en el primer acceso a /checkout */}
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />
        <TopBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingCart />
      </body>
    </html>
  );
}
