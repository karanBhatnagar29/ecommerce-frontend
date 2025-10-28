"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import RecommendedProducts from "@/components/ui/RecommendedProducts";
import AddToCartButton from "@/lib/cartApi";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
        const firstVariant = res.data.variants[0];
        setSelectedVariant(firstVariant);
        setCurrentImages(
          firstVariant.images?.length
            ? firstVariant.images
            : res.data.images || []
        );
        setSelectedImage(
          (firstVariant.images?.length
            ? firstVariant.images[0]
            : res.data.images?.[0]) || null
        );
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    const imgs = variant.images?.length ? variant.images : product.images || [];
    setCurrentImages(imgs);
    setSelectedImage(imgs[0] || null);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="flex gap-4">

          {/* Thumbnails */}
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2">
            {currentImages.map((img: string, index: number) => (
              <button
                key={img + index}
                onClick={() => setSelectedImage(img)}
                className={`border-2 rounded-lg overflow-hidden transition ${
                  selectedImage === img ? "border-green-600" : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-20 h-20 object-contain bg-white p-1 hover:opacity-90"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center border rounded-xl overflow-hidden bg-white">
            <img
              src={selectedImage || currentImages[0]}
              alt={product.name}
              className="max-h-[400px] w-auto object-contain"
            />
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
                  onClick={() => handleVariantSelect(variant)}
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

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 bg-green-700 text-white py-3 rounded-md text-lg hover:bg-green-800 transition"
              disabled={selectedVariant?.stock === 0}
              onClick={handleBuyNow}
            >
              ⚡ Buy Now
            </button>

            <div className="flex-[1] flex justify-center items-center">
              <AddToCartButton
                productId={product._id}
                variantLabel={selectedVariant?.label}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16">
        <RecommendedProducts
          categoryId={product.category}
          currentProductId={product._id}
        />
      </div>
    </div>
  );
}
