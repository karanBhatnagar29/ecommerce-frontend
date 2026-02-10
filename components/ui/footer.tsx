import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#0f6656] to-[#084a3f] text-white py-12 px-6 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        {/* Left Column */}
        <div className="space-y-4 hover:translate-y-[-2px] smooth-transition">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Zesty Crops®</h2>
          <p>
            <strong>Office</strong> - Jodhpur
          </p>
          {/* <p>
            <strong>Registered Office</strong> - IMT Manesar, Gurugram
          </p> */}
          <p>
            Grievance Redressal Officer:{" "}
            <a href="#" className="underline text-blue-200 hover:text-white">
              Zesty Crops
            </a>
          </p>

          {/* Newsletter */}
          <div className="mt-6">
            <p className="font-bold uppercase mb-2 text-sm tracking-wide">
              Subscribe to our newsletter
            </p>
            <div className="flex rounded-md overflow-hidden max-w-xs">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 text-black focus:outline-none smooth-transition"
              />
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 text-black font-semibold hover:shadow-lg smooth-transition">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3 hover:translate-y-[-2px] smooth-transition">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Services
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Track Your Order
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Our Story
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Corporate Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div className="space-y-3 hover:translate-y-[-2px] smooth-transition">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Policies
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Refund Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-yellow-300 smooth-transition">
                Sitemap
              </a>
            </li>
          </ul>
        </div>

        {/* Help & Social */}
        <div className="space-y-4 hover:translate-y-[-2px] smooth-transition">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Need Help?
          </h3>
          <button className="gradient-primary text-white py-2 px-4 rounded-full font-semibold hover:shadow-lg smooth-transition transform hover:scale-105">
            Contact Us
          </button>

          {/* Social Icons */}
          <div className="flex space-x-4 text-yellow-300">
            <a href="#">
              <i className="fab fa-facebook-f text-xl"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram text-xl"></i>
            </a>
            <a href="#">
              <i className="fas fa-envelope text-xl"></i>
            </a>
            <a href="#">
              <i className="fab fa-x-twitter text-xl"></i>
            </a>
          </div>

          {/* Download App */}
          {/* <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Download App</p>
            <div className="flex space-x-2">
              <img src="/google-play.png" alt="Google Play" className="h-10" />
              <img src="/app-store.png" alt="App Store" className="h-10" />
            </div>
          </div> */}
        </div>
      </div>

      {/* Background trees or graphics */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 bg-bottom bg-repeat-x opacity-40"
        style={{ backgroundImage: "url('/footer-bg.png')" }}
      ></div>

      {/* Copyright */}
      <div className="text-center text-sm text-white mt-12 z-10 relative">
        Copyright © 2025, Zesty Crops Pvt. Ltd.
      </div>
    </footer>
  );
};

export default Footer;
