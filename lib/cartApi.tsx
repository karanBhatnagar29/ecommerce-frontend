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
}

export default function AddToCartButton({
  productId,
  variantLabel,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false); // ✅ banner state
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setShowBanner(true); // show banner
      setTimeout(() => {
        setShowBanner(false); // hide after 2s
        router.push("/auth/login"); // redirect
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
      {/* ✅ Global Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white text-center py-3 font-medium shadow-md">
          Please login to continue
        </div>
      )}

      {/* Button */}
      <Button
        size="sm"
        variant="outline"
        className={`text-orange-600 border-orange-400 hover:bg-orange-50 text-xs px-3 ${className}`}
        onClick={handleAddToCart}
        disabled={loading}
        title={success ? "Added to cart" : "Add to cart"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <Check className="w-4 h-4" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
      </Button>
    </>
  );
}
