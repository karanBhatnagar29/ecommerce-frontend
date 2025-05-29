"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
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
        if (!token) throw new Error("Not authenticated");

        const res = await axios.get(`http://localhost:3000/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);

        const ordersRes = await axios.get(
          `http://localhost:3000/order/user/${res.data._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(ordersRes.data);
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
          {/* Sidebar */}
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

          {/* Content */}
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
                          Order ID:{" "}
                          <span className="font-medium text-gray-700">
                            {order._id}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status:{" "}
                          <span className="font-medium text-blue-600">
                            {order.status}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Total Price:{" "}
                          <span className="font-medium">
                            ₹{order.totalPrice}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on:{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
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
