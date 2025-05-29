"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";

interface AddToCartButtonProps {
  productId: string;
  variantLabel?: string; // optional prop
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
      await addItem(productId, safeVariantLabel, quantity); // ✅ fixed
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
      style={{ backgroundColor: "#D97706", color: "white" }}
      className="w-full"
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? "Adding..." : success ? "Added ✅" : "🛒 Add to Cart"}
    </Button>
  );
}
