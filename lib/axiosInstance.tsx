// // lib/axiosInstance.ts
// import axios from "axios";
// import Cookies from "js-cookie";

// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_BASE_URL, // ✅ required
//   withCredentials: true, // ✅ send cookies like session token
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Cookies.remove("token");
//       if (typeof window !== "undefined") {
//         window.location.href = "/auth/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

// lib/axiosInstance.ts
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    // ⛔ Skip auto-redirect for OTP-related endpoints
    if (
      error.response?.status === 401 &&
      !url.includes("/auth/verify-otp") &&
      !url.includes("/auth/request-otp")
    ) {
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
