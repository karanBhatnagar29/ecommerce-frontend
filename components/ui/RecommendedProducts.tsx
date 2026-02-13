"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import AddToCartButton from "@/lib/cartApi";

const placeholderImage = "/placeholder.png";

interface Variant {
  label: string;
  price: number;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  images: string[];
  variants: Variant[];
}

export default function RecommendedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!categoryId) return;

    async function fetchRecommended() {
      try {
        const categoryRes = await axiosInstance.get(
          `/categories/${categoryId}`
        );
        const slug = categoryRes.data.slug;

        const res = await axiosInstance.get(
          `/product/category/${slug}`
        );

        const filtered = res.data.filter(
          (p: Product) => p._id !== currentProductId
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch recommended products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommended();
  }, [categoryId, currentProductId]);

  const handleBuyNow = (product: Product) => {
    const selectedVariantLabel = product.variants?.[0]?.label || "";
    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariantLabel);
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="p-6 text-center text-sm sm:text-base">
        Loading recommended products...
      </div>
    );
  if (products.length === 0) return null;

  return (
    <div className="w-full py-8 sm:py-12 mt-8 sm:mt-12 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">
          Recommended Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const firstVariant = product.variants?.[0];
            const price = firstVariant?.price;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow hover:shadow-lg border border-gray-200 overflow-hidden flex flex-col cursor-pointer"
                onClick={() => router.push(`/product/${product._id}`)}
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
                  <Image
                    src={product.images?.[0] || placeholderImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <p className="text-green-700 font-semibold mt-2 text-sm sm:text-base">
                    ₹{price?.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-4 flex gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent redirect
                        handleBuyNow(product);
                      }}
                      className="flex-[3] bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition flex justify-center items-center"
                    >
                      Buy Now
                    </button>

                    <div
                      className="flex-[1] flex justify-center items-center"
                      onClick={(e) => e.stopPropagation()} // Prevent redirect
                    >
                      <AddToCartButton
                        className="w-full h-full"
                        productId={product._id}
                        variantLabel={firstVariant?.label}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
