"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";
import AddToCartButton from "@/lib/cartApi";

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  variants: { label: string; price: number; originalPrice?: number }[];
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const res = await axiosInstance.get("/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-foreground">My Wishlist</h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button onClick={() => router.push("/all-products")}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
             const price = product.variants?.[0]?.price ?? 0;
             const originalPrice = product.variants?.[0]?.originalPrice || price + 300;
             
             return (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div 
                className="relative h-64 bg-secondary cursor-pointer"
                onClick={() => router.push(`/product/${product._id}`)}
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold">₹{price.toLocaleString('en-IN')}</span>
                  {originalPrice > price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                    {/* Buy Now */}
                    <button
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
                      onClick={(e) => {
                        e.stopPropagation();
                        const selectedVariantLabel = product.variants?.[0]?.label || "";
                        sessionStorage.setItem("productId", product._id);
                        sessionStorage.setItem("variantLabel", selectedVariantLabel);
                        router.push("/checkout");
                      }}
                    >
                      Buy Now
                    </button>

                    {/* Cart + Remove */}
                    <div className="flex gap-2 items-stretch">
                      <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <AddToCartButton
                          productId={product._id}
                          variantLabel={product.variants?.[0]?.label}
                          fullWidth
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(product._id);
                        }}
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
