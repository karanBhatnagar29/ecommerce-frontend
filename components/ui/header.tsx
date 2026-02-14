"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useCart } from "@/lib/cartContext";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axiosInstance";

type Category = {
  slug: any;
  _id: string;
  name: string;
  description?: string;
};

type SearchResult = {
  _id: string;
  name: string;
  images?: string[];
  description?: string;
  variants?: { label: string; price: number }[];
};

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/product/search?q=${encodeURIComponent(query.trim())}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    // Debounce — wait 300ms after user stops typing
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const item = searchResults[selectedIndex];
      navigateToProduct(item._id);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const navigateToProduct = (id: string) => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    setMobileMenuOpen(false);
    router.push(`/product/${id}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        !mobileSearchRef.current
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search on route change
  useEffect(() => {
    setShowResults(false);
    setSearchQuery("");
    setMobileMenuOpen(false);
  }, [pathname]);

  // Search results dropdown component
  const SearchDropdown = () => {
    if (!showResults && !isSearching) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[420px] overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            No products found for &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div>
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {searchResults.map((product, index) => {
              const price = product.variants?.[0]?.price;
              const image = product.images?.[0];

              return (
                <button
                  key={product._id}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors duration-150 ${
                    index === selectedIndex
                      ? "bg-accent/10"
                      : "hover:bg-secondary/50"
                  } ${index < searchResults.length - 1 ? "border-b border-border/50" : ""}`}
                  onClick={() => navigateToProduct(product._id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary border border-border">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Search className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {highlightMatch(product.name, searchQuery)}
                    </p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  {price && (
                    <span className="text-sm font-semibold text-accent flex-shrink-0">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-accent font-semibold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

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
        <div className="hidden md:flex flex-1 max-w-lg mx-6" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
            )}
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10 pr-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/30 transition-all"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true);
              }}
            />
            <SearchDropdown />
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
            className="text-foreground relative"
            onClick={() => router.push("/wishlist")}
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
            <div className="mt-8 mb-4" ref={mobileSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
                )}
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 bg-secondary border-border"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowResults(true);
                  }}
                />
                <SearchDropdown />
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
