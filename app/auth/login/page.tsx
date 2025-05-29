"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { X } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/auth/request-otp", { phone });
      setStep(2);
      alert("OTP sent! Check your terminal (for local dev)");
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/auth/verify-otp", {
        phone,
        otp,
      });

      const { token, isProfileComplete } = res.data;
      Cookies.set("token", token, { expires: 7 });

      if (isProfileComplete) {
        alert("Login successful!");
        window.location.href = "/";
      } else {
        alert("Please complete your profile");
        window.location.href = "/auth/complete-profile";
      }
    } catch (err) {
      alert("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-[90%] max-w-md rounded-xl shadow-lg overflow-hidden text-center">
        {/* Banner Image */}
        <div className="relative">
          <img
            src="/cow.jpg" // Place this image in your public folder
            alt="Cow"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => (window.location.href = "/")}
            className="absolute top-3 right-3 bg-white rounded-full p-1 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="bg-white px-6 py-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          {step === 1 ? (
            <>
              {/* Phone Input with Flag */}
              <div className="flex items-center border rounded-md overflow-hidden mb-4">
                <div className="flex items-center gap-2 px-3 bg-gray-100 text-gray-700">
                  <img
                    src="/india.png" // Indian flag image in public folder
                    alt="IN"
                    className="h-4 w-5 object-contain"
                  />
                  <span>+91</span>
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 outline-none"
                />
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md transition"
              >
                {loading ? "Sending..." : "Login"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-md mb-4"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          <p className="text-xs text-gray-500 mt-4">
            By proceeding, you agree to our{" "}
            <a href="/terms" className="underline">
              T&C
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
