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

import axiosInstance from "@/lib/axiosInstance";

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-muted py-2 px-4 text-center text-xs sm:text-sm font-medium text-muted-foreground">
        FREE SHIPPING THIS WEEK: ORDER OVER ₹5000
      </div>

      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
          className="flex items-center space-x-2"
        >
          <span className="text-2xl font-bold text-foreground">
            Anon
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Enter your product name..."
              className="w-full pl-10 pr-4 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Account */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const token = Cookies.get("token");
              router.push(token ? "/account" : "/auth/login");
            }}
            className="text-foreground"
          >
            <User className="h-5 w-5" />
          </Button>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cart")}
            className="relative text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground font-semibold">
                {count}
              </span>
            )}
          </Button>

          {/* Language Selector */}
          <Button
            variant="ghost"
            className="hidden sm:flex items-center space-x-1 text-foreground text-sm"
          >
            <span>ENG</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
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
          <div className="relative w-72 bg-background shadow-lg z-50 p-4 flex flex-col border-r border-border">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="mt-8 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 bg-secondary border-border"
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/all-products"
                className={`font-medium transition-colors ${
                  pathname === "/all-products"
                    ? "text-accent"
                    : "text-foreground hover:text-accent"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                All products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  className={`font-medium transition-colors ${
                    pathname === `/category/${cat.slug}`
                      ? "text-accent"
                      : "text-foreground hover:text-accent"
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
