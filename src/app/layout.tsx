import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fontMontserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export async function generateMetadata(): Promise<Metadata> {
  await dbConnect();
  const settings = await SiteSettings.findOne();

  return {
    title: {
      template: '%s | Zubizo',
      default: 'Zubizo – Premium Invitation & Handcrafted Stationery',
    },
    description: settings?.homeTagline || "Modern Art & Craft invitation designs for weddings, festivals, and special events. Premium quality stationaries by Zubizo.",
    keywords: ["invitations", "wedding cards", "nikah invitations", "stationery", "handcrafted cards", "zubizo"],
    openGraph: {
      title: 'Zubizo – Premium Invitation & Handcrafted Stationery',
      description: 'Handcrafted with love for your special occasion.',
      url: 'https://zubizo.com',
      siteName: 'Zubizo',
      images: [
        {
          url: settings?.logoUrl || '/logo.png',
          width: 800,
          height: 600,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Zubizo – Premium Invitations',
      description: 'Handcrafted stationery for your special moments.',
      images: [settings?.logoUrl || '/logo.png'],
    },
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
    },
  };
}

import { CartProvider } from "@/context/cart-context";
import { Toaster } from "react-hot-toast";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${fontMontserrat.variable} antialiased`}
      >
        <GoogleAnalytics GA_MEASUREMENT_ID={gaId} />
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
