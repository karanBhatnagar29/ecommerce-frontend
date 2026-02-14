"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/lib/cartApi";
import axiosInstance from "@/lib/axiosInstance";
import { useWishlist } from "@/lib/wishlistContext";

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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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

  const handleWishlistClick = (product: any) => {
     if (isInWishlist(product._id)) {
       removeFromWishlist(product._id);
     } else {
       addToWishlist(product._id);
     }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-secondary/30 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Products</h1>
          <p className="text-muted-foreground mt-1">Browse our complete collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-6">Categories</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/all-products")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-foreground hover:text-accent transition-colors text-sm font-medium"
                >
                  All Products
                </button>
                
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(`/category/${encodeURIComponent(cat.slug)}`)
                    }
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-foreground hover:text-accent transition-colors text-sm"
                  >
                    <span className="text-lg">{/* Icon would go here */}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Best Seller Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                  Best Seller
                </h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map((product: any) => (
                    <button
                      key={product._id}
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="w-full text-left group"
                    >
                      <div className="flex gap-3 p-2 rounded hover:bg-secondary transition-colors">
                        <div className="w-12 h-12 rounded border border-border overflow-hidden flex-shrink-0 bg-secondary">
                          <Image
                            src={product.images?.[0] || placeholderImage}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-accent">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ₹{product.variants?.[0]?.price?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => {
                  const firstVariant = product.variants?.[0];
                  const price = firstVariant?.price;
                  const originalPrice = firstVariant?.originalPrice || price + 300;
                  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

                  return (
                    <div
                      key={product._id}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group"
                      onClick={() => router.push(`/product/${product._id}`)}
                    >
                      {/* Product Image */}
                      <div className="relative w-full aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                        <Image
                          src={product.images?.[0] || placeholderImage}
                          alt={product.name || "Product"}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discount > 0 && (
                          <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {product.description}
                          </p>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        {/* Price */}
                        <div className="mt-3 mb-3">
                          <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold text-foreground">
                              ₹{price?.toLocaleString("en-IN") ?? "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{originalPrice?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
