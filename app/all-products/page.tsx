"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/lib/cartApi";
import axiosInstance from "@/lib/axiosInstance";

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
          axiosInstance.get("/categories"),
          axiosInstance.get("/product"),
        ]);

        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, []);

  const handleBuyNow = (product: any) => {
    const selectedVariantLabel = product.variants?.[0]?.label || "";

    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariantLabel);

    router.push("/checkout");
  };

  const handleAddToWishlist = (product: any) => {
    console.log("Add to Wishlist:", product.name);
  };

  return (
    <div className="px-4 md:px-12 py-6 bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="w-full h-40 md:h-56 rounded-xl overflow-hidden bg-gray-200 mb-6 flex items-center justify-center text-gray-500 text-xl font-medium">
        <img
          src="/banners/all_products.webp"
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
              className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              onClick={() => router.push(`/product/${product._id}`)}
            >
              {/* Product Image */}
              {/* Product Image */}
              <div className="relative w-full h-64 bg-white flex items-center justify-center overflow-hidden rounded-t-2xl">
                <Image
                  src={product.images?.[0] || placeholderImage}
                  alt={product.name || "Product"}
                  width={300}
                  height={300}
                  className="object-contain w-auto h-full transition-transform duration-300 hover:scale-105"
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

                {/* Action Buttons Row */}
                <div className="mt-4 flex justify-between items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-3 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(product);
                    }}
                  >
                    ⚡ Buy Now
                  </Button>

                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton
                      productId={product._id}
                      variantLabel={product.variants?.[0]?.label}
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-pink-500 border-pink-400 hover:bg-pink-50 text-xs px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                  >
                    💖
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
