"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import axiosInstance from "@/lib/axiosInstance";

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

interface PaymentInfo {
  paymentMethod: string;
  transactionId: string;
  isPaid: boolean;
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
  paymentInfo: PaymentInfo;
  couponCode?: string;
  orderNotes?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      try {
        const token = Cookies.get("token");

        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(res.data);

        const ordersRes = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/order/user/${res.data._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(ordersRes.data);
        console.log(res.data._id);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
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
    <div className="bg-white min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
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
          <div className="w-full md:w-1/4 space-y-4">
            <div
              onClick={() => setActiveTab("profile")}
              className={`p-4 rounded-lg text-center cursor-pointer font-semibold transition ${
                activeTab === "profile"
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Personal Information
            </div>
            <div
              onClick={() => setActiveTab("orders")}
              className={`p-4 rounded-lg text-center cursor-pointer font-semibold transition ${
                activeTab === "orders"
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              My Orders
            </div>
          </div>

          <div className="w-full md:w-3/4">
            {activeTab === "profile" && (
              <div className="space-y-8">
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
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="text-lg text-gray-800 font-medium">
                      {user.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg text-gray-800 font-medium">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-lg text-gray-800 font-medium">
                      {user.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-lg text-gray-800 font-medium">
                      {user.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  My Orders
                </h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">No orders found.</p>
                ) : (
                  <ul className="space-y-4">
                    {orders.map((order) => (
                      <li
                        key={order._id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                      >
                        <p className="text-sm text-gray-500">
                          <strong>Order ID:</strong> {order._id}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Status:</strong> {order.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Placed on:</strong>{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {order.products.map((item, idx) => {
                            const product = item.productId;
                            const variant = product.variants.find(
                              (v) => v.label === item.variantLabel
                            );
                            return (
                              <div
                                key={idx}
                                className="flex gap-4 border p-3 rounded-lg bg-white"
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
                                    ₹{variant?.price} x {item.quantity} = ₹
                                    {variant?.price
                                      ? variant.price * item.quantity
                                      : 0}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 text-right font-bold text-gray-800">
                          Total: ₹{order.totalPrice}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <p>
                            <strong>Payment:</strong>{" "}
                            {order.paymentInfo.paymentMethod} (
                            {order.paymentInfo.isPaid ? "Paid" : "Unpaid"})
                          </p>
                          <p>
                            <strong>Shipping Address:</strong>{" "}
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
