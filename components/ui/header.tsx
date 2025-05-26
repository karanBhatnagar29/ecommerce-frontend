"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

type Category = {
  slug: any;
  _id: string;
  name: string;
  description?: string;
};

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

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
            {/* Manual All Products link */}
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

            {/* Dynamically fetched categories */}
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${encodeURIComponent(cat.slug)}`} // ✅ Correct
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
            <div className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Search spices..."
                className="w-56 pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                0
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
