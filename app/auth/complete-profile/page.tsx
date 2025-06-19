"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

export default function CompleteProfile() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.address) {
      setError("Please fill out all fields.");
      return;
    }

    const token = Cookies.get("token"); // ✅ Get token from cookies
    if (!token) {
      setError("Token not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/complete-profile`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        router.push("/"); // ✅ Redirect after success
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Profile
        </h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 mb-4 text-sm">
            Profile updated successfully! Redirecting...
          </p>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          />
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
