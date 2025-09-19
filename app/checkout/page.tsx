"use client";

import { useState, useEffect,  JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import Script from "next/script";

// ✅ API constants
const COUNTRY_CODE = "IN";
const CSC_API_KEY = "b0F1eWFtZGZyTlRwajR2S1VQdHhaVTlHdjQ1aFpqdjV2QmdDYUZ0ZQ=="

export default function CheckoutPage() {
  const [couponCode, setCouponCode] = useState("SUMMER2025");
  const [orderNotes, setOrderNotes] = useState("");
  const token = Cookies.get("token");
  const router = useRouter();

  const [shipping, setShipping] = useState({
    name: "",
    shippingAddress: "",
    phone: "",
    alternatePhone: "",
    city: "",
    state: "",
    stateISO2: "",
    pincode: "",
    deliveryInstructions: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [product, setProduct] = useState<Product | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [variantLabel, setVariantLabel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  type Variant = { label: string; price: number; originalPrice?: number };
  type Product = {
    name: string;
    images?: string[];
    variants: Variant[];
    description?: string;
  };

  // ✅ Load sessionStorage
  useEffect(() => {
    const pid = sessionStorage.getItem("productId");
    const uid = sessionStorage.getItem("userID");
    const vlabel = sessionStorage.getItem("variantLabel");
    const cart = sessionStorage.getItem("cart");

    if (cart) setCartItems(JSON.parse(cart));
    if (pid) setProductId(pid.trim());
    if (uid) setUserId(uid.trim());
    if (vlabel) setVariantLabel(vlabel.trim());
  }, []);

  // ✅ Fetch product if not in cart
  useEffect(() => {
    if (!productId || cartItems.length > 0) return;
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [productId, cartItems.length]);

  // ✅ Fetch states list from API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          `https://api.countrystatecity.in/v1/countries/${COUNTRY_CODE}/states`,
          { headers: { "X-CSCAPI-KEY": CSC_API_KEY! } }
        );
        if (!res.ok) throw new Error("Failed to load states");
        const data = await res.json();
        setStates(data);
      } catch (err) {
        console.error("Error fetching states:", err);
        toast.error("Could not load states list");
      }
    };
    fetchStates();
  }, []);

  const onStateChange = async (stateIso2: string, stateName: string) => {
    setShipping({ ...shipping, state: stateName, stateISO2: stateIso2, city: "" });
    validateField("state", stateName);

    try {
      const res = await fetch(
        `https://api.countrystatecity.in/v1/countries/${COUNTRY_CODE}/states/${stateIso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY! } }
      );
      if (!res.ok) throw new Error("Failed to fetch cities");
      const data = await res.json();
      setCities(data.map((c: any) => c.name));
    } catch (err) {
      console.error("Error fetching cities:", err);
      toast.error("Could not load cities");
    }
  };

  // ✅ Live validations
  const validateField = (field: string, value: string) => {
    let msg = "";
    if (field === "name" && !value) msg = "Full name is required.";
    if (field === "phone" && !/^[0-9]{10}$/.test(value))
      msg = "Enter a valid 10-digit phone.";
    if (field === "city" && !value) msg = "City is required.";
    if (field === "state" && !value) msg = "State is required.";
    if (field === "shippingAddress" && !value) msg = "Address is required.";
    setErrors((prev: any) => ({ ...prev, [field]: msg }));
  };

  const validateForm = () => {
    Object.entries(shipping).forEach(([k, v]) => validateField(k, v as string));
    return Object.values(errors).every((err) => !err);
  };

  // ✅ Checkout flow
  const handleCheckout = async () => {
    if (!validateForm()) return;
    const payload = {
      products:
        cartItems.length > 0
          ? cartItems.map((item) => ({
              productId: item.productId._id,
              quantity: item.quantity,
              variantLabel: item.variantLabel,
            }))
          : [{ productId, quantity, variantLabel }],
      shippingInfo: shipping,
      couponCode,
      orderNotes,
    };

    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/create-payment-intent`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { amount, razorpayOrderId, paymentIntentId } = res.data;
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Zesty Crops",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}/order/verify-payment`,
              { ...response, paymentIntentId, order: payload },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("✅ Payment successful, order created!");
            sessionStorage.clear();
            router.push("/account");
          } catch (err) {
            toast.error("❌ Payment verification failed!");
          }
        },
        prefill: { name: shipping.name, contact: shipping.phone },
        theme: { color: "#ff4d4d" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment.");
    }
  };

  const selectedVariant = product?.variants.find((v) => v.label === variantLabel);
  const subtotal = selectedVariant ? selectedVariant.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Header */}
      <header className="bg-white shadow p-4 flex items-center gap-3 sticky top-0 z-10">
        <ArrowLeft
          onClick={() => router.back()}
          className="w-5 h-5 cursor-pointer"
        />
        <h1 className="text-lg font-bold">Checkout</h1>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* Left: Shipping */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold">Shipping Information</h2>
          <ShippingForm
            shipping={shipping}
            setShipping={setShipping}
            errors={errors}
            validateField={validateField}
            states={states}
            onStateChange={onStateChange}
            cities={cities}
          />

          <InputField
            label="Order Notes"
            value={orderNotes}
            onChange={setOrderNotes}
          />

          {cartItems.length === 0 && (
            <InputField
              label="Quantity"
              type="number"
              value={quantity.toString()}
              onChange={(v: any) => {
                const num = Number(v);
                if (isNaN(num)) return;
                if (num > 100) {
                  toast.error("Quantity cannot exceed 100.");
                  return;
                }
                setQuantity(num);
              }}
            />
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          {cartItems.length > 0
            ? cartItems.map((item, idx) => <CartItem key={idx} item={item} />)
            : product && (
                <CartProduct
                  product={product}
                  variantLabel={variantLabel}
                  quantity={quantity}
                  selectedVariant={selectedVariant}
                  subtotal={subtotal}
                />
              )}
          <div className="text-lg font-bold">
            Total: ₹
            {cartItems.length > 0
              ? cartItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2)
              : subtotal.toFixed(2)}
          </div>
          <Button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-br from-red-500 to-orange-500 text-white"
          >
            Proceed to Pay
          </Button>
        </div>
      </main>
    </div>
  );
}

/* -------------------- Components -------------------- */
const CartItem = ({ item }: { item: any }) => (
  <div className="flex items-start gap-4 border rounded-md p-3">
    <img
      src={item.image || item.productId.images[0] || "/placeholder.png"}
      alt={item.productId.name}
      className="w-20 h-20 object-cover rounded-md border"
    />
    <div className="flex-1 space-y-1">
      <div className="font-medium text-sm">
        {item.productId.name} ({item.variantLabel}) x {item.quantity}
      </div>
      <div className="font-bold text-lg">₹{item.subtotal}</div>
    </div>
  </div>
);

const CartProduct = ({
  product,
  variantLabel,
  quantity,
  selectedVariant,
  subtotal,
}: any) => (
  <div className="flex items-start gap-4 border rounded-md p-3">
    <img
      src={product.images?.[0] || "/placeholder.png"}
      alt={product.name}
      className="w-20 h-20 object-cover rounded-md border"
    />
    <div className="flex-1 space-y-1">
      <div className="font-medium text-sm">
        {product.name} ({variantLabel}) x {quantity}
      </div>
      <div className="text-gray-500 line-through text-xs">
        ₹{selectedVariant?.originalPrice || ""}
      </div>
      <div className="font-bold text-lg">₹{subtotal.toFixed(2)}</div>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = "text", error }: any) => (
  <div>
    <Label className="text-sm font-medium">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="mt-1"
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

const ShippingForm = ({
  shipping,
  setShipping,
  errors,
  validateField,
  states,
  onStateChange,
  cities,
}: any) => (
  <div className="space-y-4">
    <InputField
      label="Full Name"
      value={shipping.name}
      onChange={(v: any) => {
        setShipping({ ...shipping, name: v });
        validateField("name", v);
      }}
      error={errors.name}
    />
    <InputField
      label="Phone"
      value={shipping.phone}
      onChange={(v: any) => {
        setShipping({ ...shipping, phone: v });
        validateField("phone", v);
      }}
      error={errors.phone}
      type="tel"
    />
    <InputField
      label="Alternate Phone"
      value={shipping.alternatePhone}
      onChange={(v: any) => setShipping({ ...shipping, alternatePhone: v })}
      type="tel"
    />
    <InputField
      label="Shipping Address"
      value={shipping.shippingAddress}
      onChange={(v: any) => {
        setShipping({ ...shipping, shippingAddress: v });
        validateField("shippingAddress", v);
      }}
      error={errors.shippingAddress}
    />
    {/* State dropdown */}
    <div>
      <Label>State</Label>
      <select
        className="w-full border rounded-md p-2 mt-1"
        value={shipping.stateISO2}
        onChange={(e) => {
          const iso2 = e.target.value;
          const stateObj = states.find((s: { iso2: string; }) => s.iso2 === iso2);
          if (stateObj) onStateChange(iso2, stateObj.name);
        }}
      >
        <option value="">Select state</option>
        {states.map((st: { iso2: string; name: string }) => (
          <option key={st.iso2} value={st.iso2}>
            {st.name}
          </option>
        ))}
      </select>
      {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
    </div>
    {/* City dropdown */}
    <div>
      <Label>City</Label>
      <select
        className="w-full border rounded-md p-2 mt-1"
        value={shipping.city}
        onChange={(e) => {
          setShipping({ ...shipping, city: e.target.value });
          validateField("city", e.target.value);
        }}
        disabled={!cities.length}
      >
        <option value="">Select city</option>
        {cities.map((c: string) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
    </div>
    <InputField
      label="Pincode"
      type="number"
      value={shipping.pincode}
      onChange={(v: any) => {
        setShipping({ ...shipping, pincode: v });
        validateField("pincode", v);
      }}
      error={errors.pincode}
    />
    <InputField
      label="Delivery Instructions"
      value={shipping.deliveryInstructions}
      onChange={(v: any) =>
        setShipping({ ...shipping, deliveryInstructions: v })
      }
    />
  </div>
);