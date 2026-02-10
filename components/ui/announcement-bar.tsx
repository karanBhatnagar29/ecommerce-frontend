"use client";

import React from "react";
import { useEffect, useState } from "react";

const AnnouncementBar = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-center text-white overflow-hidden relative">
      <p className={`text-sm font-medium smooth-transition ${
        animate ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}>
        <span className="inline-block mr-2">🌶️</span>
        FREE SHIPPING over ₹599 | Use Code: <strong>SPICE25</strong> for 25% OFF
      </p>
    </div>
  );
};

export default AnnouncementBar;
