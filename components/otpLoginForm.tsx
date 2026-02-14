// components/OtpLoginForm.tsx
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";

export default function OtpLoginForm() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleRequestOtp = async () => {
    try {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/request-otp`,
        {
          phone,
        }
      );
      setStep(2);
      toast.success("OTP sent! Check console (dev only)");
    } catch (err) {
      toast.error("Error sending OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-otp`,
        {
          phone,
          otp,
        }
      );

      const { token, isProfileComplete } = res.data;

      // ✅ Store JWT in cookies
      Cookies.set("token", token, { expires: 1 }); // expires in 1 day

      if (isProfileComplete) {
        toast.success("Login successful!");
        router.push("/");
      } else {
        router.push("/complete-profile");
      }
    } catch (err) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div>
      {step === 1 ? (
        <div>
          <h2>Enter Phone</h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
          />
          <button onClick={handleRequestOtp}>Send OTP</button>
        </div>
      ) : (
        <div>
          <h2>Enter OTP</h2>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
    </div>
  );
}
