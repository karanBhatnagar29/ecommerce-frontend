"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import RecommendedProducts from "@/components/ui/RecommendedProducts";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product/${id}`
        );
        setProduct(res.data);
        setSelectedVariant(res.data.variants[0]);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;

    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariant.label);

    router.push("/checkout");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product)
    return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 🔹 Product Layout (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="flex flex-col gap-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="rounded-xl object-cover w-full h-[400px]"
          />
          <div className="text-sm text-gray-500 text-center">
            {product.gstIncluded ? "GST Included" : "GST Extra"} •{" "}
            {product.courierExtra ? "Courier Charges Extra" : "Free Delivery"}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-1">
            {product.brand}
          </h3>
          <h1 className="text-3xl font-semibold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-500"
                      : "stroke-yellow-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.numReviews} reviews)
            </span>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Variant Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Choose size:
            </label>
            <div className="flex gap-3 flex-wrap">
              {product.variants.map((variant: any) => (
                <button
                  key={variant._id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 rounded border ${
                    selectedVariant?._id === variant._id
                      ? "border-green-600 bg-green-50 text-green-800"
                      : "border-gray-300 text-gray-800"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Stock */}
          <div className="text-2xl font-bold mb-2 text-green-700">
            ₹{selectedVariant?.price}
          </div>
          <div className="text-sm text-gray-500 mb-6">
            {selectedVariant?.stock > 0 ? (
              <span>{selectedVariant?.stock} in stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Buy Now Button */}
          <button
            className="w-full bg-green-700 text-white py-3 rounded-md text-lg hover:bg-green-800 transition"
            disabled={selectedVariant?.stock === 0}
            onClick={handleBuyNow}
          >
            ⚡ Buy Now
          </button>
        </div>
      </div>

      {/* 🔹 Recommended Products Section (Full Width) */}
      <div className="mt-16">
        <RecommendedProducts
          categoryId={product.category}
          currentProductId={product._id}
        />
      </div>
    </div>
  );
}
