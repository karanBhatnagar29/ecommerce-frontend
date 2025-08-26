"use client";
import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { X, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(""); // ✅ success banner
  const [error, setError] = useState(""); // ✅ inline error
  const [attempts, setAttempts] = useState(0); // ✅ track OTP tries

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/request-otp`,
        { email }
      );
      setStep(2);
      setNotification("OTP has been sent to your email!");
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-otp`,
        { email, otp }
      );

      const { token, isProfileComplete, user } = res.data;
      Cookies.set("token", token, { expires: 1080 });
      sessionStorage.setItem("userID", user._id);

      if (isProfileComplete) {
        setNotification("Login successful!");
        setError("");
        setTimeout(() => (window.location.href = "/"), 1200);
      } else {
        setNotification("Please complete your profile");
        setError("");
        setTimeout(
          () => (window.location.href = "/auth/complete-profile"),
          1200
        );
      }
    } catch (err) {
      const nextAttempts = attempts + 1; // ✅ calculate next value
      setAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        // 🚨 redirect only after 3 wrong tries
        setError("Too many wrong attempts. Redirecting to login...");
        setTimeout(() => (window.location.href = "/auth/login"), 1500);
      } else {
        // 🚫 just show error and let them retry
        setError("Invalid or expired OTP. Please try again.");
        setOtp("");
      }
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
            src="/category-banner/ghee.webp"
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

        {/* Form Section */}
        <div className="bg-white px-6 py-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          {/* ✅ Success Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm"
              >
                <CheckCircle className="h-4 w-4" /> {notification}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border rounded-md mb-4"
              />
              <button
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md transition"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              {/* ✅ Inline Error Above OTP */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1 text-sm text-red-600 mb-2"
                  >
                    <XCircle className="h-4 w-4" /> {error}
                  </motion.p>
                )}
              </AnimatePresence>

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
