"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { X, Minus, Plus, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SuccessPopup from "@/components/SuccessPopup";
import { useAuthStore } from "@/store/useAuthStore";

interface ShippingData {
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string;
  email: string;
  city: string;
  area: string;
  address: string;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const { token } = useAuthStore();
  
  const [shippingData, setShippingData] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    phone: "",
    altPhone: "",
    email: "",
    city: "",
    area: "",
    address: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOrderId, setSuccessOrderId] = useState("");

  const shippingCost = 0;
  const finalTotal = getTotalPrice;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !shippingData.firstName ||
      !shippingData.lastName ||
      !shippingData.phone ||
      !shippingData.email ||
      !shippingData.city ||
      !shippingData.area ||
      !shippingData.address
    ) {
      setError("Please fill in all required shipping details");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the address string
      const fullAddress = `${shippingData.address}, ${shippingData.area}, ${shippingData.city}`;

      // Map cart items to the API products format
      const orderProducts = items.map((item) => ({
        productId: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.discountPrice || item.price,
      }));

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`, {
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone,
        customerEmail: shippingData.email,
        customerAddress: fullAddress,
        products: orderProducts,
        totalPrice: finalTotal,
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

      if (response.status === 201) {
        clearCart();
        setSuccessOrderId(response.data.order._id);
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setError(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success popup after order is placed (cart is already cleared at this point)
  if (successOrderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <SuccessPopup
          title="Order Placed! 🎉"
          message="Your order has been confirmed successfully."
          subMessage={`Order ID: ${successOrderId}`}
          onClose={() => { setSuccessOrderId(""); }}
        />
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-6">
              Add some books to get started!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Items and Shipping */}
          <div className="lg:col-span-2">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded-md shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-orange-600">
                          ৳{item.discountPrice || item.price}
                        </span>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 hover:bg-gray-200"
                          >
                            −
                          </button>
                          <span className="px-3 font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name *"
                    value={shippingData.firstName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name *"
                    value={shippingData.lastName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    required
                  />
                  <input
                    type="tel"
                    name="altPhone"
                    placeholder="Alternative Phone Number"
                    value={shippingData.altPhone}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={shippingData.email}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    required
                  />
                  <input
                    type="text"
                    name="area"
                    placeholder="Area / Upazila *"
                    value={shippingData.area}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    required
                  />
                </div>
                <textarea
                  name="address"
                  rows={3}
                  placeholder="Address / Special Directions *"
                  value={shippingData.address}
                  onChange={(e) => setShippingData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right - Order Summary & Payment */}
          <div>
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Costs */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{getTotalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    <Truck size={16} />
                    Shipping
                  </span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-3 bg-orange-50 rounded-lg border-2 border-orange-600">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ৳{finalTotal}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6 space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Payment Method
                </h3>
                <label className="flex items-center gap-3 p-3 border-2 border-orange-600 rounded-lg cursor-pointer bg-orange-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 font-semibold text-gray-800">
                    Cash on Delivery
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-600">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 font-semibold text-gray-800">
                    Card Payment
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-600">
                  <input
                    type="radio"
                    name="payment"
                    value="mobile"
                    checked={paymentMethod === "mobile"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 font-semibold text-gray-800">
                    Bkash/Nagad
                  </span>
                </label>
              </div>

              {/* Checkout Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 mb-3"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>

              <Link
                href="/"
                className="block text-center py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-orange-600 transition"
              >
                Continue Shopping
              </Link>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
