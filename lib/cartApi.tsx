"use client";

import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  variantLabel?: string;
  quantity?: number;
  className?: string;
  fullWidth?: boolean;
  showLabel?: boolean;
}

export default function AddToCartButton({
  productId,
  variantLabel,
  quantity = 1,
  className = "",
  fullWidth = false,
  showLabel = false,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    const token = Cookies.get("token");

    if (!token) {
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
        router.push("/auth/login");
      }, 2000);
      return;
    }

    const safeVariantLabel =
      typeof variantLabel === "string" && variantLabel.trim() !== ""
        ? variantLabel
        : "default";

    setLoading(true);
    try {
      await addItem(productId, safeVariantLabel, quantity);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Login Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white text-center py-3 font-medium shadow-md animate-slide-down">
          Please login to continue
        </div>
      )}

      {/* Button */}
      <button
        className={`
          relative overflow-hidden
          inline-flex items-center justify-center gap-2
          rounded-lg border-2 font-semibold
          transition-all duration-300 ease-out
          ${fullWidth ? "w-full" : ""}
          ${success
            ? "border-green-500 bg-green-50 text-green-600 scale-[0.97]"
            : "border-accent/30 bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-md active:scale-95"
          }
          ${showLabel ? "px-6 py-3 text-base" : "px-4 py-3 text-sm"}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        onClick={handleAddToCart}
        disabled={loading}
      >
        {/* Success ripple effect */}
        {success && (
          <span className="absolute inset-0 animate-ping-once bg-green-400/20 rounded-lg" />
        )}

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <>
            <Check className="w-5 h-5 animate-bounce-in" />
            {showLabel && <span>Added!</span>}
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {showLabel && <span>Add to Cart</span>}
          </>
        )}
      </button>
    </>
  );
}
