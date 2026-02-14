"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import AddToCartButton from "@/lib/cartApi";
import { useWishlist } from "@/lib/wishlistContext";

const placeholderImage = "/placeholder.png";

type Category = {
  slug: string;
  name: string;
  image?: string;
  description?: string;
};

export default function CategorySlugPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [banner, setBanner] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const slug = decodeURIComponent(params?.slug as string);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, allProdRes, bannerRes] = await Promise.all([
          axiosInstance.get("/categories"),
          axiosInstance.get(
            `/product/category/${slug}`
          ),
          axiosInstance.get("/product"),
          axiosInstance.get(`/banner/category/${encodeURIComponent(slug)}`) 
        ]);

        console.log("Banner response:", bannerRes.data);

        setCategories(catRes.data);
        setProducts(prodRes.data);
        setAllProducts(allProdRes.data);

        if (bannerRes.data && bannerRes.data.length > 0) {
            setBanner(bannerRes.data[0].image);
        } else {
            setBanner(null);
        }

        const firstProductId = allProdRes.data?.[0]?._id;
        if (firstProductId) {
          sessionStorage.setItem("productId", firstProductId);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, [slug]);

  const handleBuyNow = (product: any) => {
    const selectedVariantLabel = product.variants?.[0]?.label || "";

    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariantLabel);

    router.push("/checkout");
  };

  const handleWishlistClick = (product: any) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  return (
    <div className="px-4 md:px-12 py-6 bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="w-full h-40 md:h-56 rounded-xl overflow-hidden bg-gray-200 mb-6 flex items-center justify-center text-gray-500 text-xl font-medium">
        <img
          src={banner || `/category-banner/${slug}.webp`}
          alt={`${slug} banner`}
          className="object-cover w-full h-full"
          onError={(e) => {
            if (!banner) {
               (e.target as HTMLImageElement).src =
               "/category-banner/default_category.jpg";
            }
          }}
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
                width={300}
                height={300}
                className="object-contain w-full h-full bg-white"
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
                  fill
                  className="object-contain"
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

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {/* Buy Now */}
                  <button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(product);
                    }}
                  >
                    Buy Now
                  </button>

                  {/* Cart + Wishlist */}
                  <div className="flex gap-2 items-stretch">
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton
                        productId={product._id}
                        variantLabel={product.variants?.[0]?.label}
                        fullWidth
                      />
                    </div>

                    <button
                      className={`
                        relative w-10 rounded-lg border-2 flex items-center justify-center
                        transition-all duration-300 active:scale-90
                        ${isInWishlist(product._id)
                          ? "border-red-400 bg-red-50 text-red-500"
                          : "border-border hover:border-red-300 hover:bg-red-50/50 text-muted-foreground"
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistClick(product);
                      }}
                    >
                      <svg
                        className={`w-4 h-4 transition-all duration-300 ${
                          isInWishlist(product._id) ? "scale-110 animate-heart-pop" : "scale-100"
                        }`}
                        fill={isInWishlist(product._id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isInWishlist(product._id) && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <span
                              key={i}
                              className="absolute w-1 h-1 bg-red-400 rounded-full animate-burst-particle"
                              style={{ '--angle': `${i * 60}deg` } as React.CSSProperties}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
