"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Image from "next/image";
import AddToCartButton from "@/lib/cartApi";
import { useRouter } from "next/navigation";

const placeholderImage = "/placeholder.png";

type Product = {
  _id: string;
  name: string;
  description: string;
  images?: string[];
  rating?: number;
  numReviews?: number;
  variants?: { label: string; price: number }[];
};

import axiosInstance from "@/lib/axiosInstance";

const ProductGrid = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await axiosInstance.get("/product/category/spices");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    fetchData();
  }, []);

  const handleBuyNow = (product: Product) => {
    const selectedVariantLabel = product.variants?.[0]?.label || "";

    // Store product info in sessionStorage
    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariantLabel);

    // Navigate to checkout
    router.push("/checkout");
  };

  const handleAddToWishlist = (product: Product) => {
    console.log("Add to Wishlist:", product.name);
  };

  return (
    <div className="px-4 md:px-8 lg:px-12 py-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Featured Products
          </h2>
          <p className="text-muted-foreground">
            Curated selection of our best-selling items
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = product.variants?.[0]?.price ?? 0;
            const originalPrice = price + 300;
            const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

            return (
              <Card
                key={product._id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group"
                onClick={() => router.push(`/product/${product._id}`)}
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.images?.[0] || placeholderImage}
                    alt={product.name || "Product"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {product.description}
                    </p>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                      {product.name}
                    </h3>

                    {product.rating && (
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex text-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-accent" />
                          ))}
                        </div>
                        <span className="ml-1 text-muted-foreground">
                          ({product.numReviews || 0})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="mt-3 mb-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-foreground">
                        ₹{price?.toLocaleString("en-IN") ?? "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Buttons Row */}
                  <div className="flex gap-2">
                    {/* Add to Cart */}
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton
                        productId={product._id}
                        variantLabel={product.variants?.[0]?.label}
                      />
                    </div>

                    {/* Wishlist */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-accent border-border hover:bg-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(product);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
