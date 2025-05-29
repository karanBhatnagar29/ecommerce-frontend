"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, Check, Loader2 } from "lucide-react"; // icon components

interface AddToCartButtonProps {
  productId: string;
  variantLabel?: string;
  quantity?: number;
}

export default function AddToCartButton({
  productId,
  variantLabel,
  quantity = 1,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    const token = Cookies.get("token");

    if (!token) {
      alert("Please login to add items to your cart.");
      router.push("/login");
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
    <Button
      size="sm"
      variant="outline"
      className="text-orange-600 border-orange-400 hover:bg-orange-50 p-2"
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
  );
}
