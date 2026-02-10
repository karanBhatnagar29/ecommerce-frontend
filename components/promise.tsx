"use client";

import Image from "next/image";

const promises = [
  {
    title: "AUTHENTICITY",
    description: "Bringing purest form of food direct from the farms",
    imageAlt: "Authenticity Icon",
    imageSrc: "/icons/authenticity.png", // Replace with actual image path
  },
  {
    title: "TRADITION",
    description: "Harnessing age-old wisdom passed down by Grandmas",
    imageAlt: "Tradition Icon",
    imageSrc: "/icons/tradition.png", // Replace with actual image path
  },
  {
    title: "TRUST",
    description: "Being 100% transparent & thoroughly lab-tested",
    imageAlt: "Trust Icon",
    imageSrc: "/icons/trust.png", // Replace with actual image path
  },
  {
    title: "PURPOSE",
    description: "Empowering rural India with employment & fair trade",
    imageAlt: "Purpose Icon",
    imageSrc: "/icons/purpose.png", // Replace with actual image path
  },
];

export default function Promise() {
  return (
    <section className="bg-gradient-to-b from-[#f5f5f5] to-[#f0f0f0] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-green-800 mb-12">
          The Zesty Crops Promise
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {promises.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group hover:translate-y-[-8px] smooth-transition">
              <div className="w-24 h-24 mb-4 relative group-hover:scale-110 smooth-transition">
                {/* Replace with Image from public folder or avatar library */}
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-green-700 smooth-transition">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm max-w-xs group-hover:text-gray-700 smooth-transition">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
