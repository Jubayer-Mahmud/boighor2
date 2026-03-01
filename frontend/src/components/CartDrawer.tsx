"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600">Your cart is empty</p>
              <Link
                href="/"
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 pb-4 border-b border-gray-200"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded-md shrink-0"
                />

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{item.author}</p>

                  {/* Price */}
                  <div className="mt-2 flex gap-2">
                    <span className="font-bold text-orange-600">
                      ৳{item.discountPrice || item.price}
                    </span>
                    {item.discountPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        ৳{item.price}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-3 flex items-center gap-2 bg-gray-100 rounded-md w-fit">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-200 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-200 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">৳{getTotalPrice}</span>
            </div>

            {/* View Cart Button */}
            <Link
              href="/cart"
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-md hover:bg-orange-700 transition text-center block"
              onClick={onClose}
            >
              View Cart & Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
