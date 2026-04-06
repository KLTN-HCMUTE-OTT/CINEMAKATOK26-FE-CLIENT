import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
          {children}
          <Analytics />
          <ScrollToTopButton />
          <Toaster position="top-right" richColors />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
