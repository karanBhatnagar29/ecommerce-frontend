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
    <div className="min-h-screen bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-xs text-muted-foreground mt-1">Complete your order</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:px-8 py-8">
        {/* Left: Shipping (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>
              <button className="ml-auto text-xs text-accent hover:text-accent/80 font-medium">
                + Add New
              </button>
            </div>

            <div className="space-y-4">
              <ShippingForm
                shipping={shipping}
                setShipping={setShipping}
                errors={errors}
                validateField={validateField}
                states={states}
                onStateChange={onStateChange}
                cities={cities}
              />
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4 cursor-pointer hover:border-accent hover:bg-secondary/50 transition-all">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-accent bg-accent mr-3"></div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h.01M11 15h.01M15 15h.01M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                      </svg>
                      CARD / ONLINE
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Secure UPI & Online Payments</p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 cursor-pointer hover:border-muted-foreground hover:bg-secondary/30 transition-all">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mr-3"></div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v3H2V4z"/>
                        <path d="M2 7h20v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"/>
                      </svg>
                      CASH ON DELIVERY
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Pay when you receive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Order Notes (Optional)
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any special instructions for your order..."
              className="w-full border border-border rounded-lg px-4 py-3 text-foreground bg-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
            />
          </div>

          {cartItems.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Quantity
              </label>
              <input
                type="number"
                value={quantity.toString()}
                onChange={(v: any) => {
                  const num = Number(v.target.value);
                  if (isNaN(num)) return;
                  if (num > 100) {
                    toast.error("Quantity cannot exceed 100.");
                    return;
                  }
                  setQuantity(num);
                }}
                className="w-full border border-border rounded-lg px-4 py-3 text-foreground bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>
            
            {/* Products */}
            <div className="space-y-4 mb-6 pb-6 border-b border-border">
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
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">
                  ₹{cartItems.length > 0
                    ? cartItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2)
                    : subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-accent font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span className="text-foreground font-medium">
                  ₹{(cartItems.length > 0
                    ? cartItems.reduce((acc, i) => acc + i.subtotal, 0)
                    : subtotal) * 0.05}.00
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-semibold">NET TOTAL</span>
                <span className="text-2xl font-bold text-foreground">
                  ₹{(cartItems.length > 0
                    ? cartItems.reduce((acc, i) => acc + i.subtotal, 0) * 1.05
                    : subtotal * 1.05).toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-semibold rounded-lg transition-all duration-200"
            >
              COMPLETE ORDER
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By clicking above, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------- Components -------------------- */
const CartItem = ({ item }: { item: any }) => (
  <div className="flex gap-3">
    <img
      src={item.image || item.productId.images[0] || "/placeholder.png"}
      alt={item.productId.name}
      className="w-16 h-16 object-cover rounded-lg border border-border"
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground line-clamp-2">
        {item.productId.name}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {item.variantLabel} × {item.quantity}
      </p>
      <p className="text-sm font-bold text-foreground mt-1">₹{item.subtotal.toLocaleString("en-IN")}</p>
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
  <div className="flex gap-3">
    <img
      src={product.images?.[0] || "/placeholder.png"}
      alt={product.name}
      className="w-16 h-16 object-cover rounded-lg border border-border"
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground line-clamp-2">
        {product.name}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {variantLabel} × {quantity}
      </p>
      <p className="text-xs text-muted-foreground line-through">
        ₹{(selectedVariant?.price ? selectedVariant.price + 500 : 0).toLocaleString("en-IN")}
      </p>
      <p className="text-sm font-bold text-foreground mt-1">₹{subtotal.toFixed(2)}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = "text", error }: any) => (
  <div>
    <Label className="text-sm font-semibold text-foreground mb-2 block">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full border border-border rounded-lg px-4 py-2 text-foreground bg-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>

    <InputField
      label="Shipping Address"
      value={shipping.shippingAddress}
      onChange={(v: any) => {
        setShipping({ ...shipping, shippingAddress: v });
        validateField("shippingAddress", v);
      }}
      error={errors.shippingAddress}
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">State</Label>
        <select
          className="w-full border border-border rounded-lg px-4 py-2 text-foreground bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
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
        {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground mb-2 block">City</Label>
        <select
          className="w-full border border-border rounded-lg px-4 py-2 text-foreground bg-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
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
        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InputField
        label="Pincode"
        type="text"
        value={shipping.pincode}
        onChange={(v: any) => {
          setShipping({ ...shipping, pincode: v });
          validateField("pincode", v);
        }}
        error={errors.pincode}
      />
      <InputField
        label="Alternate Phone"
        value={shipping.alternatePhone}
        onChange={(v: any) => setShipping({ ...shipping, alternatePhone: v })}
        type="tel"
      />
    </div>

    <InputField
      label="Delivery Instructions (Optional)"
      value={shipping.deliveryInstructions}
      onChange={(v: any) =>
        setShipping({ ...shipping, deliveryInstructions: v })
      }
    />
  </div>
);
