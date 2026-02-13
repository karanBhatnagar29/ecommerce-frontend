"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

interface Banner {
    _id: string;
    image: string;
    title: string;
    isActive: boolean;
}

export default function HeroCarousel() {
  const [heroSlides, setHeroSlides] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchBanners = async () => {
        try {
            const res = await axiosInstance.get("/banner");
            setHeroSlides(res.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  if (heroSlides.length === 0) {
      return <div className="h-[70vh] w-full bg-gray-100 animate-pulse" />;
  }

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover brightness-[0.6]"
          />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 h-full w-full flex items-center justify-center text-white px-4">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {heroSlides[currentSlide].title}
          </h1>

          <Button
            className="mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-8 py-3 text-lg text-white"
            onClick={() => router.push("/all-products")}
          >
            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
