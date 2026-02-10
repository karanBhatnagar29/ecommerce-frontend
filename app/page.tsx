"use client";

import HeroCarousel from "@/components/hero/heroCarosuel";
import Promise from "@/components/promise";
import ProductGrid from "@/components/ui/displayProduct";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />
      <ProductGrid />
      <Promise />
    </div>
  );
}
