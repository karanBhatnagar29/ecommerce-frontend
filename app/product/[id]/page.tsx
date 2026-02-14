"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import RecommendedProducts from "@/components/ui/RecommendedProducts";
import AddToCartButton from "@/lib/cartApi";
import ReviewsSection from "@/components/ui/reviewsSection";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

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
    sessionStorage.removeItem("cart"); // ✅ Clear cart so checkout uses single product
    sessionStorage.setItem("productId", product._id);
    sessionStorage.setItem("variantLabel", selectedVariant.label);
    router.push("/checkout");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product)
    return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-16">
          {/* Product Images Section — Amazon-style */}
          <div className="flex flex-col-reverse lg:flex-row gap-3 lg:sticky lg:top-6 lg:self-start">
            {/* Thumbnails — vertical strip on desktop, horizontal on mobile */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[520px] py-1 lg:py-0 px-1 lg:px-0 scrollbar-thin">
              {currentImages.map((img: string, index: number) => (
                <button
                  key={img + index}
                  onClick={() => setSelectedImage(img)}
                  onMouseEnter={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-[60px] h-[60px] lg:w-[72px] lg:h-[72px] rounded-md overflow-hidden border-2 transition-all duration-150 ${
                    selectedImage === img
                      ? "border-accent shadow-md ring-1 ring-accent/30"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover bg-white"
                  />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom */}
            <div className="flex-1 relative">
              <div
                ref={mainImageRef}
                className="relative w-full aspect-square border border-border rounded-xl overflow-hidden bg-white cursor-crosshair"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={selectedImage || currentImages[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-opacity duration-200"
                  style={{ opacity: isZooming ? 0.4 : 1 }}
                  draggable={false}
                />
                {/* Zoomed overlay */}
                {isZooming && (
                  <div
                    className="absolute inset-0 pointer-events-none bg-no-repeat"
                    style={{
                      backgroundImage: `url(${selectedImage || currentImages[0]})`,
                      backgroundSize: '250%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                  />
                )}
              </div>
              {/* Image counter badge */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {currentImages.indexOf(selectedImage || currentImages[0]) + 1} / {currentImages.length}
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            {/* Brand & Title */}
            <div className="mb-4">
              <p className="text-sm uppercase text-muted-foreground tracking-wider font-medium mb-2">
                {product.brand || "Premium"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                {product.name}
              </h1>
            </div>

            {/* Rating — only show if there are reviews */}
            {(product.numReviews > 0 || product.rating > 0) && (
              <button 
                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground underline decoration-dotted underline-offset-4">
                  ({product.numReviews} reviews)
                </span>
              </button>
            )}

            {/* Description */}
            <p className="text-foreground/80 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price Section */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Price</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  ₹{selectedVariant?.price?.toLocaleString("en-IN")}
                </p>
                <p className="text-lg text-muted-foreground line-through">
                  ₹{(selectedVariant?.price ? selectedVariant.price + 500 : 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Availability</p>
              {selectedVariant?.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm font-medium text-accent">
                    In Stock ({selectedVariant?.stock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-sm font-medium text-destructive">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Variant Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Variant: Main Product
              </label>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant._id}
                    onClick={() => handleVariantSelect(variant)}
                    className={`px-5 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                      selectedVariant?._id === variant._id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{variant.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        ₹{variant.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Already Sold: {100 - (selectedVariant?.stock || 0)} / Available: {selectedVariant?.stock || 0}
              </p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((100 - (selectedVariant?.stock || 0)) / 100 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-lg text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedVariant?.stock === 0}
                onClick={handleBuyNow}
              >
                BUY NOW
              </button>

              <div className="flex-1">
                <AddToCartButton
                  productId={product._id}
                  variantLabel={selectedVariant?.label}
                  fullWidth
                  showLabel
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-foreground">Premium Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-foreground">Free Shipping on Orders Over ₹500</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-foreground">30-Day Return Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <ReviewsSection productId={product._id} />
        </div>

        {/* Recommended Products */}
        <div className="border-t border-border pt-16">
          <RecommendedProducts
            categoryId={product.category}
            currentProductId={product._id}
          />
        </div>
      </div>
    </div>
  );
}
