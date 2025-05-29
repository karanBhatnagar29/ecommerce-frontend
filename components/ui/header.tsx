"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useCart } from "@/lib/cartContext"; // custom cart hook
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Cookies from "js-cookie";

type Category = {
  slug: any;
  _id: string;
  name: string;
  description?: string;
};

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const { count, cartItems } = useCart(); // get count & cart items

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
              <span className="text-lg font-bold text-white">Z</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Zesty Crops
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm font-medium overflow-x-auto max-w-[60vw]">
            <Link
              href="/all-products"
              className={`whitespace-nowrap ${
                pathname === "/all-products"
                  ? "text-red-600 font-semibold"
                  : "text-gray-700 hover:text-red-600 transition-colors"
              }`}
            >
              All products
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${encodeURIComponent(cat.slug)}`}
                className={`whitespace-nowrap ${
                  pathname === `/category/${cat.slug}`
                    ? "text-red-600 font-semibold"
                    : "text-gray-700 hover:text-red-600 transition-colors"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search bar */}
            <div className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Search spices..."
                className="w-56 pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Account icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const token = Cookies.get("token");
                if (token) {
                  router.push("/account");
                } else {
                  router.push("/auth/login");
                }
              }}
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Cart with preview */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/cart")}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {count}
                </span>
              </Button>

              {/* Hover Preview Dropdown */}
              <div className="absolute right-0 top-10 w-80 bg-white shadow-lg border rounded-lg p-4 z-50 hidden group-hover:block">
                {cartItems && cartItems.length > 0 ? (
                  <>
                    <h4 className="text-sm font-semibold mb-2">Cart Preview</h4>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {cartItems.slice(0, 3).map(
                        (item: {
                          _id: React.Key | null | undefined;
                          image: string | StaticImport;
                          productId: {
                            images: any;
                            name:
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | Promise<
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | React.ReactPortal
                                  | React.ReactElement<
                                      unknown,
                                      string | React.JSXElementConstructor<any>
                                    >
                                  | Iterable<React.ReactNode>
                                  | null
                                  | undefined
                                >
                              | null
                              | undefined;
                          };
                          quantity:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactPortal
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          price:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactPortal
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          subtotal:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactPortal
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-3"
                          >
                            <Image
                              src={
                                item.productId.images?.[0] || "/placeholder.png"
                              }
                              alt={
                                typeof item.productId.name === "string"
                                  ? item.productId.name
                                  : ""
                              }
                              width={50}
                              height={50}
                              className="rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.productId.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x ₹{item.price}
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">
                              ₹{item.subtotal}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <Link
                      href="/cart"
                      className="mt-4 block w-full text-center bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-semibold"
                    >
                      Go to Cart
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
