"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";

interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
}

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axiosInstance.get("/offer");
        setOffers(res.data);
      } catch (error) {
        console.error("Failed to fetch offers", error);
      }
    };
    fetchOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                <p className="text-gray-600">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
