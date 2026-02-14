"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await axiosInstance.get("/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming backend returns an object with a 'products' array of objects or IDs
        // We need to map them to IDs if they are populated objects
        const ids = res.data.products.map((p: any) => p._id || p); 
        setWishlist(ids);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    };

    fetchWishlist();
  }, []);

  const addToWishlist = async (productId: string) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      await axiosInstance.post(
        "/wishlist/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist((prev) => [...prev, productId]);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Failed to add to wishlist", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      await axiosInstance.delete(`/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
