"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";

const placeholderImage = "/placeholder.png";

type Category = {
  slug: string;
  name: string;
  image?: string;
  description?: string;
};

export default function ProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_CATEGORY_API}`),
          axios.get(`${process.env.NEXT_PUBLIC_PRODUCTS_API}`),
        ]);

        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product: any) => {
    console.log("Add to Cart:", product.name);
  };

  const handleBuyNow = (product: any) => {
    console.log("Buy Now:", product.name);
  };

  const handleAddToWishlist = (product: any) => {
    console.log("Add to Wishlist:", product.name);
  };

  return (
    <div className="px-4 md:px-12 py-6 bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="w-full h-40 md:h-56 rounded-xl overflow-hidden bg-gray-200 mb-6 flex items-center justify-center text-gray-500 text-xl font-medium">
        <img
          src="/banners/all_products.jpg"
          alt="All Products Banner"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-6 justify-center overflow-x-auto pb-4 px-4 md:px-12 scroll-snap-x">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="flex flex-col items-center scroll-snap-start w-24 shrink-0 cursor-pointer"
            onClick={() =>
              router.push(`/category/${encodeURIComponent(cat.slug)}`)
            }
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-orange-400 hover:border-orange-500 transition duration-200">
              <Image
                src={cat.image || placeholderImage}
                alt={cat.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="mt-1 text-center text-sm">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
        {products.map((product: any) => {
          const firstVariant = product.variants?.[0];
          const price = firstVariant?.price;
          const originalPrice = firstVariant?.originalPrice || price + 300;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden rounded-t-2xl">
                <Image
                  src={product.images?.[0] || placeholderImage}
                  alt={product.name || "Product"}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow">
                  ⭐ Best Seller
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-2">
                  <p className="text-lg font-bold text-gray-800">
                    ₹{price?.toLocaleString("en-IN") ?? "N/A"}{" "}
                    <span className="text-sm font-medium text-gray-400 line-through ml-1">
                      ₹{originalPrice?.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-sm text-emerald-600 font-medium">
                    Save ₹{(originalPrice - price).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex flex-col space-y-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleAddToCart(product)}
                  >
                    🛒 Add to Cart
                  </Button>

                  <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-white"
                    onClick={() => handleBuyNow(product)}
                  >
                    ⚡ Buy Now
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-pink-500 text-pink-500 hover:bg-pink-50"
                    onClick={() => handleAddToWishlist(product)}
                  >
                    💖 Add to Wishlist
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
