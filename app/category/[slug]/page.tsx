export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";

import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

const placeholderImage = "/placeholder.png";
const fallbackBanner = "/banners/default_category.jpg";

const bannerMap: Record<string, string> = {
  ghee: "/category-banner/ghee.jpg",
  spices: "/category-banner/spices.jpg",
  "kachi-ghani-oil-(unfiltered)": "/category-banner/oil.jpg",
  "western-rajasthan's-dry-vegetables": "/category-banner/raj_spices.jpg",
};

type Product = {
  _id: string;
  name: string;
  description: string;
  brand: string;
  images: string[];
  variants: {
    label: string;
    price: number;
    stock: number;
    _id: string;
  }[];
  rating: number;
  numReviews: number;
};

type Props = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: Props) {
  const slug = decodeURIComponent(await Promise.resolve(params.slug));

  try {
    const { data: products } = await axios.get<Product[]>(
      `${process.env.NEXT_PUBLIC_PRODUCTS_API}/category/${slug}`,
      { headers: { "Cache-Control": "no-store" } }
    );

    const bannerImage = bannerMap[slug] || fallbackBanner;

    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Banner */}
        <div className="relative w-full h-44 md:h-64">
          <Image
            src={bannerImage}
            alt="Category Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-bold capitalize tracking-wide text-center px-4">
              {slug.replace(/-/g, " ")}
            </h1>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-4 md:px-12 py-8">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 bg-orange-100 px-4 py-2 inline-block rounded-lg">
              {products.length} product{products.length !== 1 && "s"} in "
              {slug.replace(/-/g, " ")}"
            </h2>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 text-center">
              No products found for this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
              {products.map((product) => {
                const imageUrl = product.images?.[0] || placeholderImage;
                const price = product.variants?.[0]?.price || 0;

                return (
                  <div key={product._id} className="flex flex-col h-full">
                    <Link href={`/product/${product._id}`} className="h-full">
                      <div className="flex flex-col h-full bg-white rounded-2xl shadow-md hover:shadow-xl border hover:border-orange-400 transition-all duration-300 overflow-hidden">
                        {/* Image */}
                        <div className="relative w-full h-56 md:h-64 bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                          />
                          <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                            ⭐ Best Seller
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow justify-between">
                          <div>
                            <h3 className="font-semibold text-base text-gray-800 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="text-yellow-500 mt-3 text-sm">
                            {"★".repeat(Math.round(product.rating))}
                            <span className="text-gray-500 ml-1">
                              {product.numReviews} reviews
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{price.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              Best Price ₹{price.toLocaleString()} with coupon
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return notFound();
  }
}
