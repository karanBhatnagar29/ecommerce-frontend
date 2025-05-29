// components/OtpLoginForm.tsx
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function OtpLoginForm() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleRequestOtp = async () => {
    try {
      await axios.post("http://localhost:3000/auth/request-otp", { phone });
      setStep(2);
      alert("OTP sent! Check console (dev only)");
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:3000/auth/verify-otp", {
        phone,
        otp,
      });

      const { token, isProfileComplete } = res.data;

      // ✅ Store JWT in cookies
      Cookies.set("token", token, { expires: 1 }); // expires in 1 day

      if (isProfileComplete) {
        alert("Login successful!");
        router.push("/");
      } else {
        router.push("/complete-profile");
      }
    } catch (err) {
      alert("Invalid OTP");
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
