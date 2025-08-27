"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import axiosInstance from "@/lib/axiosInstance";
import Script from "next/script";

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface Variant {
  label: string;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  images: string[];
  variants: Variant[];
}

interface OrderProduct {
  productId: Product;
  quantity: number;
  variantLabel?: string;
}

interface ShippingInfo {
  shippingAddress: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  totalPrice: number;
  status: string;
  createdAt: string;
  shippingInfo: ShippingInfo;
  couponCode?: string;
  orderNotes?: string;
  paymentInfo?: {
    paymentMethod?: string;
    transactionId?: string;
    isPaid?: boolean;
  };
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const fetchProfileAndOrders = async () => {
    try {
      const token = Cookies.get("token");

      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data);

      const ordersRes = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/user/${res.data._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  // 🔹 Handle Razorpay payment
  const handlePayment = async (order: Order) => {
    try {
      const token = Cookies.get("token");

      // 1️⃣ Create order on backend
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/create-payment`,
        { orderId: order._id, amount: order.totalPrice },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { razorpayOrderId, amount, key } = res.data;

      // 2️⃣ Open Razorpay checkout
      const options = {
        key,
        amount,
        currency: "INR",
        name: "My Shop",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 3️⃣ Verify payment on backend
            await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}/order/verify-payment`,
              {
                orderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🔄 Refresh orders list
            fetchProfileAndOrders();
          } catch (err) {
            console.error("Payment verification failed", err);
          }
        },
        prefill: {
          name: user?.username,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error starting payment", err);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Loading profile...</p>
    );
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-500">User not found.</p>;
  }

  return (
    <>
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              My Account
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" /> Logout
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 space-y-4">
              <div
                onClick={() => setActiveTab("profile")}
                className={`p-4 rounded-lg text-center cursor-pointer font-semibold transition ${
                  activeTab === "profile"
                    ? "bg-yellow-400 text-white shadow"
                    : "bg-white hover:bg-gray-100 border"
                }`}
              >
                Personal Information
              </div>
              <div
                onClick={() => setActiveTab("orders")}
                className={`p-4 rounded-lg text-center cursor-pointer font-semibold transition ${
                  activeTab === "orders"
                    ? "bg-yellow-400 text-white shadow"
                    : "bg-white hover:bg-gray-100 border"
                }`}
              >
                My Orders
              </div>
            </div>

            {/* Main content */}
            <div className="w-full md:w-3/4">
              {activeTab === "profile" && (
                <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <UserCircleIcon className="w-20 h-20 text-green-600" />
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {user.username}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Welcome to your dashboard
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                    <Info label="Username" value={user.username} />
                    <Info label="Email" value={user.email} />
                    <Info label="Phone" value={user.phone} />
                    <Info label="Address" value={user.address} />
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <ShoppingBagIcon className="w-6 h-6 text-yellow-500" />
                    My Orders
                  </h2>
                  {orders.length === 0 ? (
                    <p className="text-gray-500">No orders found.</p>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <p className="text-sm text-gray-500">
                              <strong>Order ID:</strong> {order._id}
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                order.status === "pending"
                                  ? "text-yellow-600"
                                  : order.status === "delivered"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {order.status.toUpperCase()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            <strong>Placed on:</strong>{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>

                          {/* Products */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {order.products.map((item, idx) => {
                              const product = item.productId;
                              const variant = product.variants.find(
                                (v) => v.label === item.variantLabel
                              );
                              return (
                                <div
                                  key={idx}
                                  className="flex gap-4 border p-3 rounded-lg bg-gray-50"
                                >
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-800">
                                      {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Brand: {product.brand}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Variant: {item.variantLabel}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">
                                      ₹{variant?.price || "-"} x {item.quantity}{" "}
                                      = ₹
                                      {variant?.price
                                        ? variant.price * item.quantity
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 text-right font-bold text-gray-800">
                            Total: ₹{order.totalPrice}
                          </div>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                        
                            <p>
                              <strong>Shipping:</strong>{" "}
                              {order.shippingInfo.shippingAddress},{" "}
                              {order.shippingInfo.city},{" "}
                              {order.shippingInfo.state} -{" "}
                              {order.shippingInfo.pincode}
                            </p>
                            {order.couponCode && (
                              <p>
                                <strong>Coupon Applied:</strong>{" "}
                                {order.couponCode}
                              </p>
                            )}
                            {order.orderNotes && (
                              <p>
                                <strong>Note:</strong> {order.orderNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg text-gray-800 font-medium">{value || "-"}</p>
    </div>
  );
}
