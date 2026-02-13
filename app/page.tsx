"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/hero/heroCarosuel";
import Promise from "@/components/promise";
import ProductGrid from "@/components/ui/displayProduct";
import { FaWhatsapp } from "react-icons/fa";
import WhatsappButton from "@/components/ui/whatsappButton";
import OffersSection from "@/components/ui/OffersSection";

const heroImages = [
  "/hero1.jpg", // Replace with your actual image URLs
  "/hero2.jpg",
  "/hero3.jpg",
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5s auto-change

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroCarousel />
      <OffersSection />
      <ProductGrid />
      <Promise />
      {/* Floating WhatsApp Button */}
      <WhatsappButton />
    </div>
  );
}
