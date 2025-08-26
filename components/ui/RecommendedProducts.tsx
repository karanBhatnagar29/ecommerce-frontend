"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useCart } from "@/lib/cartContext";

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
  const { addItem } = useCart();

  useEffect(() => {
    if (!categoryId) return;

    async function fetchRecommended() {
      try {
        const categoryRes = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}`
        );
        const slug = categoryRes.data.slug;

        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product/category/${slug}`
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
    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", product.variants[0].label);
    router.push("/checkout");
  };

  const handleAddToCart = (product: Product) => {
    addItem(product._id, product.variants[0].label, 1);
  };

  if (loading)
    return (
      <div className="p-6 text-center">Loading recommended products...</div>
    );
  if (products.length === 0) return null;

  return (
    <div className="w-full py-12 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-8 text-gray-800">
          Recommended Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                className="w-full h-48 object-cover"
                onClick={() => router.push(`/product/${p._id}`)}
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-medium text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.brand}</p>
                <p className="text-green-700 font-semibold mt-2">
                  ₹{p.variants[0]?.price}
                </p>

                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={() => handleBuyNow(p)}
                    className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
