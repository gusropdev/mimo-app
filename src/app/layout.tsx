import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "MIMO — Lista de Desejos",
  description: "O app exclusivo para compartilhar desejos e presentes.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MIMO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 antialiased selection:bg-rose-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
