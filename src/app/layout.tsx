import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { env } from "@/env";
import { StoreHydrator } from "@/store/store-hydrator";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CINEMAKATOK - OTT Platform for Movie Lovers",
  description:
    "Cinemakatok is an OTT platform that offers a wide range of movies for streaming. Discover, watch, and enjoy your favorite films all in one place.",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <StoreHydrator />
            <main>
              {children}
            </main>
            <Analytics />
            <ScrollToTopButton />
            <Toaster position="top-right" richColors />
          </GoogleOAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
