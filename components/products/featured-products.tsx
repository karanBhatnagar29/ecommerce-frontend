import { Star } from "lucide-react";
import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";

const FeaturedProducts = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Your Favorites | All in One Place
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              id: 1,
              name: "Premium Cardamom",
              price: "₹299",
              originalPrice: "₹399",
              discount: "25%",
              badge: "New Launch",
              badgeColor: "bg-blue-500",
              image: "cardamom pods green spice premium quality",
            },
            {
              id: 2,
              name: "Organic Turmeric Powder",
              price: "₹149",
              originalPrice: "₹199",
              discount: "25%",
              badge: "Best Seller",
              badgeColor: "bg-green-500",
              image: "turmeric powder organic golden spice",
            },
            {
              id: 3,
              name: "Kashmiri Red Chili",
              price: "₹199",
              originalPrice: "₹249",
              discount: "20%",
              badge: "Hot Deal",
              badgeColor: "bg-red-500",
              image: "kashmiri red chili powder spice",
            },
            {
              id: 4,
              name: "Cinnamon Sticks",
              price: "₹179",
              originalPrice: "₹229",
              discount: "22%",
              badge: "Premium",
              badgeColor: "bg-purple-500",
              image: "cinnamon sticks whole spice premium",
            },
          ].map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=200&width=200&query=${product.image}`}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div
                  className={`absolute left-3 top-3 rounded-full ${product.badgeColor} px-3 py-1 text-xs font-medium text-white`}
                >
                  {product.badge}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                  {product.discount} OFF
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-lg font-bold text-red-600">
                    {product.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {product.originalPrice}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                </div>
                <Button className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
