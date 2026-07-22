import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Trueverse | Digital trust for real-world interactions",
  description:
    "A digital trust and reputation platform for positive interactions, evidence-backed reports, and community help."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppShell profile={profile}>{children}</AppShell>
      </body>
    </html>
  );
}
