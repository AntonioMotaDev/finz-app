import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

// next/font descarga la fuente en build y la sirve desde el mismo dominio:
// sin peticiones a terceros en runtime (mejor rendimiento y CSP más estricta).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Finz · Finanzas personales",
    template: "%s · Finz",
  },
  description: "Gestiona tus finanzas personales de manera inteligente",
  applicationName: "Finz",
  robots: { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce de la CSP generado en proxy.ts (para el script anti-parpadeo del tema)
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
