"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";

export default function CartPage() {
  const { cartItems, removeItem, increaseItem, decreaseItem } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleCheckout = () => {
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
    router.push("/checkout"); // Checkout page auto-opens modal
  };

  if (!cartItems || cartItems.length === 0) {
    return <p className="text-center py-10">Your cart is empty.</p>;
  }

  const total = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 border rounded-lg p-4 shadow-sm bg-white relative"
            >
              <Image
                src={
                  item.image || item.productId.images?.[0] || "/placeholder.png"
                }
                alt={item.productId.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.productId.name}</h3>
                <p className="text-sm text-gray-500">{item.variantLabel}</p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => decreaseItem(item._id)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    -
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => increaseItem(item._id)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    +
                  </button>
                </div>

                <p className="mt-2 font-medium text-orange-600">
                  ₹{item.price} each
                </p>
              </div>

              <div className="text-right font-semibold text-gray-700">
                ₹{item.subtotal}
              </div>

              {/* ✅ FIXED remove (use item._id, not productId._id) */}
              <button
                onClick={() => handleRemove(item.productId._id)}
                className="absolute top-2 right-2 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Items ({cartItems.length})</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-4">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-md transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
