"use client";
import { useState, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { X, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/request-otp`,
        { email }
      );
      setStep(2);
      setNotification("OTP has been sent to your email!");
      setError("");
      setTimeout(() => setNotification(""), 4000);

      // focus OTP input
      setTimeout(() => otpInputRef.current?.focus(), 300);
      startCooldown();
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }
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
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setError("Too many wrong attempts. Redirecting to login...");
        setTimeout(() => (window.location.href = "/auth/login"), 1500);
      } else {
        setError("Invalid or expired OTP. Please try again.");
        setOtp("");
        otpInputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email.replace(
    /(.{2})(.*)(?=@)/,
    (_, a, b) => a + "*".repeat(b.length)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white w-[90%] max-w-md rounded-xl shadow-lg overflow-hidden text-center">
        {/* Banner */}
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

        {/* Form */}
        <div className="bg-white px-6 py-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          {/* ✅ Notifications */}
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
                onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
              />
              <button
                onClick={handleRequestOtp}
                disabled={loading || !email}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              {/* Info about email */}
              <p className="text-sm text-gray-600 mb-3">
                Enter the OTP sent to <b>{maskedEmail}</b>
              </p>

              {/* Error */}
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
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-md mb-4 text-center tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP */}
              <div className="mt-3 text-xs text-gray-500">
                {resendCooldown > 0 ? (
                  <span>Resend OTP in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={handleRequestOtp}
                    className="flex items-center gap-1 text-green-700 hover:underline mx-auto"
                  >
                    <RefreshCcw className="h-3 w-3" /> Resend OTP
                  </button>
                )}
              </div>
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
