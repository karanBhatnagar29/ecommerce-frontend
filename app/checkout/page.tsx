"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Product = {
  productName: string;
  variantLabel: string;
  quantity: number;
  // Add other fields if needed
};

const CheckoutPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingDetails, setShippingDetails] = useState({
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch this from localStorage/context or router query (for buy now)
    const cartData = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    setProducts(cartData);
  }, []);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId"); // or get from auth context
      const payload = {
        userId,
        products,
        shippingDetails,
      };

      const response = await axios.post(
        "http://51.20.166.225:3001/order",
        payload
      );
      alert("Order placed successfully!");
      router.push("/thank-you");
    } catch (err) {
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="space-y-2">
        {products.map((item, idx) => (
          <div key={idx} className="border p-2 rounded">
            <p>
              <strong>Product:</strong> {item.productName}
            </p>
            <p>
              <strong>Variant:</strong> {item.variantLabel}
            </p>
            <p>
              <strong>Quantity:</strong> {item.quantity}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Input
          name="address"
          placeholder="Shipping Address"
          value={shippingDetails.address}
          onChange={handleChange}
        />
        <Input
          name="phone"
          placeholder="Phone Number"
          value={shippingDetails.phone}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
