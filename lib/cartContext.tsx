"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

// --- Types ---
export interface Product {
  _id: string;
  name: string;
  images: string[];
}

export interface CartItem {
  _id: string;
  productId: Product;
  variantLabel: string;
  price: number;
  subtotal: number;
  quantity: number;
  image: string;
}

interface Cart {
  items: CartItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  fetchCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  removeItem: (itemId: string) => Promise<void>;
  addItem: (
    productId: string,
    variantLabel: string,
    quantity?: number
  ) => Promise<void>;
  count: number;
}

// --- Default context ---
const CartContext = createContext<CartContextType>({
  cartItems: [],
  fetchCart: async () => {},
  setCart: () => {},
  removeItem: async () => {},
  addItem: async () => {},
  count: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ items: [] });

  const fetchCart = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setCart({ items: [] });
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(response.data);
    } catch (err: any) {
      // ✅ Gracefully handle 401
      if (err.response && err.response.status === 401) {
        Cookies.remove("token"); // Optional: clear token
        setCart({ items: [] }); // Clear cart
      } else {
        console.error("Cart fetch error:", err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (itemId: string) => {
    const token = Cookies.get("token");
    if (!token) {
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
      return;
    }

    // Optimistically update UI
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== itemId),
    }));

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optional: re-fetch to confirm sync
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  const addItem = async (
    productId: string,
    variantLabel: string,
    quantity: number = 1
  ) => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
        { productId, variantLabel, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh cart after adding
      await fetchCart();
    } catch (error) {
      console.error("Failed to add item to cart", error);
    }
  };

  const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: cart.items,
        fetchCart,
        setCart,
        removeItem,
        addItem,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
