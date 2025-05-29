import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0f6656] text-white py-12 px-6 md:px-16 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        {/* Left Column */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Zesty Crops®</h2>
          <p>
            <strong>Corporate Office</strong> - Sector 44, Gurugram
          </p>
          <p>
            <strong>Registered Office</strong> - IMT Manesar, Gurugram
          </p>
          <p>
            Grievance Redressal Officer:{" "}
            <a href="#" className="underline text-blue-200 hover:text-white">
              Suyash Gupta
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
                className="w-full px-4 py-2 text-black"
              />
              <button className="bg-yellow-400 px-4 text-black font-semibold">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Services
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="#" className="hover:underline">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Track Your Order
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Our Story
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Corporate Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div className="space-y-3">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Policies
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Refund Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Sitemap
              </a>
            </li>
          </ul>
        </div>

        {/* Help & Social */}
        <div className="space-y-4">
          <h3 className="text-yellow-300 font-bold uppercase text-sm">
            Need Help?
          </h3>
          <button className="bg-yellow-400 text-black py-2 px-4 rounded-full font-semibold hover:bg-yellow-300">
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
        Copyright © 2025, Anveshan Farm Technologies Pvt. Ltd.
      </div>
    </footer>
  );
};

export default Footer;
