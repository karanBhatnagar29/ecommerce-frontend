"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

export default function CheckoutModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [couponCode, setCouponCode] = useState("SUMMER2025");
  const [orderNotes, setOrderNotes] = useState("Gift wrap this order, please");
  const token = Cookies.get("token");
  const router = useRouter();

  const [shipping, setShipping] = useState({
    shippingAddress: "",
    phone: "",
    alternatePhone: "",
    city: "",
    state: "",
    pincode: "",
    deliveryInstructions: "",
  });

  const [errors, setErrors] = useState({
    phone: "",
    city: "",
    state: "",
    pincode: "",
    shippingAddress: "", // ✅ add this
  });

  const [product, setProduct] = useState<Product | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [variantLabel, setVariantLabel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  type Variant = {
    label: string;
    price: number;
    originalPrice?: number;
  };

  type Product = {
    name: string;
    images?: string[];
    variants: Variant[];
    description?: string;
    brand?: string;
    category?: string;
    rating?: number;
  };

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

  useEffect(() => {
    if (!productId || cartItems.length > 0) return;

    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(
          `http://51.20.166.225:3000/product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [productId, cartItems.length]);

  const validateForm = () => {
    const newErrors: any = {};
    const phoneRegex = /^[0-9]{10}$/;

    if (!shipping.phone || !phoneRegex.test(shipping.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }
    if (!shipping.city) {
      newErrors.city = "City is required.";
    }
    if (!shipping.state) {
      newErrors.state = "State is required.";
    }
    if (!shipping.pincode) {
      newErrors.pincode = "Pincode is required.";
    }
    if (!shipping.shippingAddress) {
      newErrors.shippingAddress = "Shipping address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiatePayment = async () => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    if (!validateForm()) return;

    const payload = {
      userId,
      products:
        cartItems.length > 0
          ? cartItems.map((item) => ({
              productId: item.productId._id,
              quantity: item.quantity,
              variantLabel: item.variantLabel,
            }))
          : [
              {
                productId,
                quantity,
                variantLabel,
              },
            ],
      shippingInfo: shipping,
      couponCode,
      orderNotes,
    };

    try {
      const res = await axiosInstance.post(
        "http://51.20.166.225:3000/order/initiate-payment",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrUrl(res.data.qrUrl);
      setPaymentIntentId(res.data.paymentIntentId);
    } catch (error) {
      console.error("Payment init error:", error);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentIntentId) return;

    const payload = {
      userId,
      products:
        cartItems.length > 0
          ? cartItems.map((item) => ({
              productId: item.productId._id,
              quantity: item.quantity,
              variantLabel: item.variantLabel,
            }))
          : [
              {
                productId,
                quantity,
                variantLabel,
              },
            ],
      shippingInfo: shipping,
      paymentInfo: {
        paymentMethod: "UPI",
        transactionId: "UPI_TXN_123456",
        isPaid: true,
      },
      couponCode,
      orderNotes,
    };

    try {
      const res = await axiosInstance.post(
        `http://51.20.166.225:3000/order/confirm/${paymentIntentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          payload,
        }
      );

      alert("Order placed successfully!");
      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("productId");
      setIsOpen(false);
    } catch (error) {
      console.error("Order confirm error:", error);
    }
  };

  const selectedVariant = product?.variants.find(
    (v) => v.label === variantLabel
  );
  const subtotal = selectedVariant ? selectedVariant.price * quantity : 0;
  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowLeft
              onClick={() => {
                setIsOpen(false);
                sessionStorage.removeItem("productId");
                router.back();
              }}
              className="w-5 h-5 cursor-pointer"
            />
            <div className="text-white font-bold text-lg">Zesty Crops</div>
          </div>
          <X
            className="w-5 h-5 cursor-pointer"
            onClick={() => {
              setIsOpen(false);
              router.back();
            }}
          />
        </div>

        <div className="p-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border rounded-md p-3"
              >
                <img
                  src={
                    item.image || item.productId.images[0] || "/placeholder.png"
                  }
                  alt={item.productId.name}
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm text-gray-800">
                    {item.productId.name}{" "}
                    <span className="text-gray-500">({item.variantLabel})</span>{" "}
                    x {item.quantity}
                  </div>
                  <div className="font-bold text-lg">₹{item.subtotal}</div>
                </div>
              </div>
            ))
          ) : product ? (
            <div className="flex items-start gap-4 border rounded-md p-3">
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm text-gray-800">
                  {product.name}{" "}
                  <span className="text-gray-500">({variantLabel})</span> x{" "}
                  {quantity}
                </div>
                <div className="text-xs text-gray-500">
                  {product.description}
                </div>
                <div className="text-gray-500 line-through text-xs">
                  ₹{selectedVariant?.originalPrice || ""}
                </div>
                <div className="font-bold text-lg">₹{subtotal.toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <p>Loading product details...</p>
          )}

          <div className="text-lg font-semibold text-gray-800 mb-2">
            Total Amount: ₹
            {cartItems.length > 0
              ? cartItems
                  .reduce((acc, item) => acc + item.subtotal, 0)
                  .toFixed(2)
              : (selectedVariant?.price || 0 * quantity).toFixed(2)}
          </div>

          {qrUrl ? (
            <div className="border p-3 rounded text-center">
              <div className="font-semibold mb-2">Scan this QR to Pay</div>
              <img src={qrUrl} alt="QR Code" className="w-40 mx-auto" />
              <Button
                onClick={handleConfirmPayment}
                className="mt-4 w-full bg-gradient-to-br from-red-500 to-orange-500 text-white"
              >
                I have paid. Confirm Order
              </Button>
            </div>
          ) : (
            <>
              <ShippingForm
                shipping={shipping}
                setShipping={setShipping}
                errors={errors}
              />
              <InputField
                label="Order Notes"
                value={orderNotes}
                onChange={(v) => setOrderNotes(v)}
              />
              {cartItems.length === 0 && (
                <InputField
                  label="Quantity"
                  type="number"
                  value={quantity.toString()}
                  onChange={(v) => setQuantity(Number(v))}
                />
              )}
              <Button
                onClick={handleInitiatePayment}
                className="w-full bg-gradient-to-br from-red-500 to-orange-500 text-white"
              >
                Proceed to Pay
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  error?: string;
}) => (
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
}: {
  shipping: any;
  setShipping: (v: any) => void;
  errors: any;
}) => (
  <>
    <h3 className="font-medium mb-4">Shipping Details</h3>
    <div className="space-y-4">
      <InputField
        label="Phone"
        value={shipping.phone}
        onChange={(v) => setShipping({ ...shipping, phone: v })}
        error={errors.phone}
      />
      <InputField
        label="Alternate Phone"
        value={shipping.alternatePhone}
        onChange={(v) => setShipping({ ...shipping, alternatePhone: v })}
      />
      {/* <div className="space-y-1">
        <Label>Shipping Address</Label>
        <Input
          placeholder="Enter shipping address"
          value={shipping.shippingAddress}
          onChange={(e) =>
            setShipping({ ...shipping, shippingAddress: e.target.value })
          }
        />
      </div> */}
      <InputField
        label="Shipping Address"
        value={shipping.shippingAddress}
        onChange={(v) => setShipping({ ...shipping, shippingAddress: v })}
        error={errors.shippingAddress} // ✅ Add this
      />

      <InputField
        label="City"
        value={shipping.city}
        onChange={(v) => setShipping({ ...shipping, city: v })}
        error={errors.city}
      />
      <InputField
        label="State"
        value={shipping.state}
        onChange={(v) => setShipping({ ...shipping, state: v })}
        error={errors.state}
      />
      <InputField
        label="Pincode"
        value={shipping.pincode}
        onChange={(v) => setShipping({ ...shipping, pincode: v })}
        error={errors.pincode}
      />
      <InputField
        label="Delivery Instructions"
        value={shipping.deliveryInstructions}
        onChange={(v) => setShipping({ ...shipping, deliveryInstructions: v })}
      />
    </div>
  </>
);
