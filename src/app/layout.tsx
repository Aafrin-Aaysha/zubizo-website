import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Parisienne } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#b19cd9",
};

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: ["400"],
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
    description: settings?.homeTagline || "Premier handcrafted invitations & luxury stationery for weddings, nikah, and special events. Elegant designs customized for your story by Zubizo Art.",
    keywords: ["zubizo", "zubizo art", "handcrafted invitations", "wedding cards india", "nikah invitations", "luxury stationery", "custom invitations", "invitation studio"],
    openGraph: {
      title: 'Zubizo Art – Premium Invitation & Handcrafted Stationery',
      description: 'Handcrafted with love for your special occasion.',
      url: 'https://www.zubizoart.com',
      siteName: 'Zubizo Art',
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
      icon: "/logo.png",
    },
  };
}

import { CartProvider } from "@/context/cart-context";
import { Toaster } from "react-hot-toast";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics";
import { CustomCursor } from "@/components/ui/custom-cursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';

  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${cormorantGaramond.variable} ${parisienne.variable} antialiased`}
      >
        <CustomCursor />
        <GoogleAnalytics GA_MEASUREMENT_ID={gaId} />
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
