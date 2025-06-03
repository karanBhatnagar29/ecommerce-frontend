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

const ProductGrid = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:3000/product/category/spices");
      const data = await res.json();
      setProducts(data);
    };

    fetchData();
  }, []);

  const handleBuyNow = (product: Product) => {
    console.log("Buy Now:", product.name);
  };

  const handleAddToWishlist = (product: Product) => {
    console.log("Add to Wishlist:", product.name);
  };

  return (
    <div className="px-4 md:px-12 py-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-900">
        Your Favorites | All in One Place
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
        {products.map((product) => {
          const price = product.variants?.[0]?.price ?? 0;
          const originalPrice = price + 300;

          return (
            <Card
              key={product._id}
              className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              onClick={() => router.push(`/product/${product._id}`)}
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
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-400">1 Kg</p>
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {product.description}
                  </p>

                  <div className="flex items-center mt-1 text-yellow-500 text-sm">
                    <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                    {product.rating} ({product.numReviews} reviews)
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-lg font-bold text-gray-800">
                    ₹{price?.toLocaleString("en-IN") ?? "N/A"}
                    <span className="text-sm font-medium text-gray-400 line-through ml-1">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Save ₹{(originalPrice - price).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Buttons Row */}
                <div className="mt-4 flex justify-between items-center gap-2">
                  {/* Buy Now */}
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

                  {/* Cart */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton
                      productId={product._id}
                      variantLabel={product.variants?.[0]?.label}
                    />
                  </div>

                  {/* Wishlist */}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
