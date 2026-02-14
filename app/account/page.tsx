"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import axiosInstance from "@/lib/axiosInstance";
import Script from "next/script";

interface ShippingInfo {
  shippingAddress: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
}

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

interface Order {
  _id: string;
  products: OrderProduct[];
  totalPrice: number;
  status: string;
  createdAt: string;
  shippingInfo: ShippingInfo;
  shippingDetails?: {
    trackingNumber?: string;
    courier?: string;
  };
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
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    } else if (tab === "settings") {
      setActiveTab("settings");
    }
  }, [searchParams]);

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

      <div className="bg-background min-h-screen py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                My Account
              </h1>
              <p className="text-muted-foreground mt-2">Manage your profile and orders</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
                <h3 className="text-sm uppercase font-bold text-muted-foreground tracking-wider mb-4">
                  Menu
                </h3>
                <nav className="space-y-2">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: "📊" },
                    { id: "orders", label: "My Orders", icon: "📦" },
                    { id: "settings", label: "Settings", icon: "⚙️" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                        activeTab === item.id
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="inline-block mr-2">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* User Card */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                          <UserCircleIcon className="w-10 h-10 text-accent" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-foreground">
                          {user.username}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                          Welcome back to your dashboard
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Info label="Username" value={user.username} />
                    <Info label="Email" value={user.email} />
                    <Info label="Phone" value={user.phone} />
                    <Info label="Address" value={user.address} />
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <ShoppingBagIcon className="w-6 h-6 text-accent" />
                    <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <ShoppingBagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-muted-foreground">No orders found yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="px-6 py-4 border-b border-border">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs uppercase text-muted-foreground font-semibold">
                                  ORDER PLACED
                                </p>
                                <p className="text-foreground font-medium mt-1">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase text-muted-foreground font-semibold">
                                  TOTAL AMOUNT
                                </p>
                                <p className="text-foreground font-bold text-lg mt-1">
                                  ₹{order.totalPrice.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase text-muted-foreground font-semibold">
                                  SHIP TO
                                </p>
                                <p className="text-foreground font-medium mt-1">
                                  {order.shippingInfo.city}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase text-muted-foreground font-semibold">
                                  ORDER STATUS
                                </p>
                                <p
                                  className={`font-bold uppercase text-sm mt-1 ${
                                    order.status === "pending"
                                      ? "text-yellow-600"
                                      : order.status === "delivered"
                                      ? "text-accent"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {order.status}
                                </p>
                              </div>
                            </div>
                            
                            {/* Visual Progress Bar */}
                            <div className="mt-6 flex flex-col md:flex-row items-center justify-between w-full relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 hidden md:block" />
                                {["pending", "confirmed", "processing", "shipped", "delivered"].map((step, index) => {
                                  
                                  const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
                                  const currentStatusIndex = steps.indexOf(order.status || "pending");
                                  const stepIndex = steps.indexOf(step);
                                  const isCompleted = stepIndex <= currentStatusIndex;

                                  return (
                                    <div key={step} className="flex flex-col items-center bg-card p-2 md:p-0 z-10">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                        isCompleted ? "bg-accent border-accent text-accent-foreground" : "bg-card border-gray-300 text-gray-400"
                                      }`}>
                                        {isCompleted ? "✓" : index + 1}
                                      </div>
                                      <span className={`text-xs mt-2 font-medium capitalize ${
                                        isCompleted ? "text-accent" : "text-muted-foreground"
                                      }`}>
                                        {step}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>

                          </div>

                          {/* Order Items */}
                          <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
                            {order.products.map((item, idx) => {
                              const product = item.productId;
                              const variant = product.variants.find(
                                (v) => v.label === item.variantLabel
                              );
                              return (
                                <div
                                  key={idx}
                                  className="flex gap-4 p-3 bg-secondary rounded-lg"
                                >
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded border border-border"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground line-clamp-1">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.variantLabel} · Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm font-bold text-foreground mt-1">
                                      ₹{variant?.price
                                        ? (variant.price * item.quantity).toLocaleString("en-IN")
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Footer */}
                          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              <p>
                                <strong>Order ID:</strong> {order._id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            {order.shippingDetails?.trackingNumber && (
                              <a
                                href={`https://www.delhivery.com/track/package/${order.shippingDetails.trackingNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium text-sm transition-colors text-center"
                              >
                                TRACK PACKAGE
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <p className="text-muted-foreground">Settings feature coming soon</p>
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
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">
        {label}
      </p>
      <p className="text-lg font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}
