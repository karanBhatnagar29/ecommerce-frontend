import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/ui/announcement-bar";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { CartProvider } from "@/lib/cartContext";
import WhatsappButton from "@/components/ui/whatsappButton";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f6656",
};

export const metadata: Metadata = {
  title: "Zest Crops | Premium Authentic Spices",
  description: "Pure, organic spices sourced directly from farms. 100% authentic blends with no artificial additives.",
  keywords: ["spices", "organic", "authentic", "farm fresh", "Indian spices"],
  openGraph: {
    title: "Zest Crops | Premium Authentic Spices",
    description: "Pure, organic spices sourced directly from farms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsappButton />
          </div>
          <Toaster 
            position="bottom-right" 
            richColors 
            theme="light"
            closeButton
          />
        </CartProvider>
      </body>
    </html>
  );
}
