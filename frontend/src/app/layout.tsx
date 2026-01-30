import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tarjeta de Crédito Digital | Banco Digital",
  description: "Solicita tu tarjeta de crédito 100% digital. Aprobación rápida, sin papeleos. Beneficios exclusivos y cupos desde $500.000 hasta $40.000.000 COP.",
  keywords: ["tarjeta de crédito", "banco digital", "solicitud online", "crédito Colombia"],
  openGraph: {
    title: "Tarjeta de Crédito Digital | Banco Digital",
    description: "Solicita tu tarjeta de crédito 100% digital con beneficios exclusivos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
