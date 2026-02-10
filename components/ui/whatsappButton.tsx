"use client";

import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsappButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <a
      href="https://wa.me/918107000617"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-5 right-5 bg-gradient-to-br from-green-500 to-green-600 hover:shadow-2xl text-white p-4 rounded-full smooth-transition transform hover:scale-110 z-50 ${
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} className="animate-bounce" style={{ animationDuration: "2s" }} />
    </a>
  );
};

export default WhatsappButton;
