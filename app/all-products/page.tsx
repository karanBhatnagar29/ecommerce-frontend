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
                        <div className="flex gap-2">
                          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <AddToCartButton
                              productId={product._id}
                              variantLabel={product.variants?.[0]?.label}
                            />
                          </div>

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
