import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Trueverse | Portable digital trust",
  description:
    "Help people make safer and more informed decisions with transparent, verified reputation signals based on real-world interactions."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
