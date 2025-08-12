"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useCart } from "@/lib/cartContext";
import Cookies from "js-cookie";

type Category = {
  slug: any;
  _id: string;
  name: string;
  description?: string;
};

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-center relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden absolute left-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
            <span className="text-sm font-bold text-white">Z</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Zesty Crops
          </span>
        </Link>

        {/* Desktop Categories */}
        <nav className="hidden md:flex items-center space-x-5 text-sm font-medium ml-6">
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

        {/* Right: Search + Icons */}
        <div className="absolute right-4 flex items-center space-x-2 md:static md:space-x-4">
          {/* Search (Desktop only) */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search spices..."
              className="w-56 pl-10 pr-4"
            />
          </div>

          {/* Account */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const token = Cookies.get("token");
              router.push(token ? "/account" : "/auth/login");
            }}
          >
            <User className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cart")}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-64 bg-white shadow-lg z-50 p-4 flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <nav className="mt-8 flex flex-col space-y-4">
              <Link
                href="/all-products"
                className={`${
                  pathname === "/all-products"
                    ? "text-red-600 font-semibold"
                    : "text-gray-700 hover:text-red-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                All products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  className={`${
                    pathname === `/category/${cat.slug}`
                      ? "text-red-600 font-semibold"
                      : "text-gray-700 hover:text-red-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
