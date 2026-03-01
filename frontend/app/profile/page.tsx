"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User, Lock, MapPin, ShoppingBag, ChevronRight, ChevronDown,
  Package, CheckCircle2, Truck, XCircle, Clock, RotateCcw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Tab = "profile" | "orders" | "address";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  area?: string;
  city?: string;
}

interface OrderProduct {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customerAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  products: OrderProduct[];
}

const STATUS_STYLES: Record<string, string> = {
  Pending:    "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped:    "bg-indigo-100 text-indigo-700",
  Delivered:  "bg-green-100 text-green-700",
  Cancelled:  "bg-red-100 text-red-700",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending:    <Clock size={14} />,
  Processing: <RotateCcw size={14} />,
  Shipped:    <Truck size={14} />,
  Delivered:  <CheckCircle2 size={14} />,
  Cancelled:  <XCircle size={14} />,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {STATUS_ICON[status]} {status}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, token, isLoggedIn, init } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Password state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPages, setOrderPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Address state
  const [addrForm, setAddrForm] = useState({ address: "", area: "", city: "" });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState({ type: "", text: "" });

  // Auth guard
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchProfile();
  }, [isLoggedIn]);

  useEffect(() => {
    if (tab === "orders" && isLoggedIn) fetchOrders(orderPage);
  }, [tab, orderPage, isLoggedIn]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setProfileForm({ name: data.user.name || "", phone: data.user.phone || "" });
        setAddrForm({
          address: data.user.address || "",
          area: data.user.area || "",
          city: data.user.city || "",
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchOrders = useCallback(async (page: number) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API}/orders/my?page=${page}&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data.orders);
        setOrderPages(data.data.pagination.pages);
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
      } else {
        setProfileMsg({ type: "error", text: data.message || "Update failed." });
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API}/users/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: "success", text: "Password changed successfully." });
        setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwMsg({ type: "error", text: data.message || "Failed to change password." });
      }
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API}/users/me/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setAddrMsg({ type: "success", text: "Address updated successfully." });
      } else {
        setAddrMsg({ type: "error", text: data.message || "Update failed." });
      }
    } finally {
      setAddrSaving(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await fetch(`${API}/orders/my/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "Cancelled" } : o));
      } else {
        alert(data.message || "Could not cancel order.");
      }
    } finally {
      setCancellingId(null);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  const Msg = ({ msg }: { msg: { type: string; text: string } }) =>
    msg.text ? (
      <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
        {msg.text}
      </div>
    ) : null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile Info", icon: <User size={18} /> },
    { id: "orders", label: "My Orders", icon: <ShoppingBag size={18} /> },
    { id: "address", label: "Default Address", icon: <MapPin size={18} /> },
  ];

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Sidebar ── */}
          <aside className="md:w-56 shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Avatar */}
              <div className="bg-orange-600 px-5 py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <User size={32} className="text-white" />
                </div>
                <p className="text-white font-bold truncate">{profile?.name || authUser?.name}</p>
                <p className="text-orange-200 text-xs truncate">{profile?.email || authUser?.email}</p>
              </div>
              <nav className="p-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${
                      tab === t.id
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            {/* ─── Profile Tab ─── */}
            {tab === "profile" && (
              <div className="space-y-6">
                {/* Update profile */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <User size={20} className="text-orange-500" /> Personal Information
                  </h2>
                  {profileLoading ? (
                    <p className="text-gray-400 text-sm">Loading…</p>
                  ) : (
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div>
                        <label className={labelCls}>Full Name</label>
                        <input className={inputCls} value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" required />
                      </div>
                      <div>
                        <label className={labelCls}>Email</label>
                        <input className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} value={profile?.email || ""} disabled />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Phone Number</label>
                        <input className={inputCls} value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
                      </div>
                      <Msg msg={profileMsg} />
                      <button type="submit" disabled={profileSaving} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm">
                        {profileSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Change password */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <Lock size={20} className="text-orange-500" /> Change Password
                  </h2>
                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div>
                      <label className={labelCls}>Current Password</label>
                      <input type="password" className={inputCls} value={pwForm.oldPassword} onChange={(e) => setPwForm((p) => ({ ...p, oldPassword: e.target.value }))} placeholder="Enter current password" required />
                    </div>
                    <div>
                      <label className={labelCls}>New Password</label>
                      <input type="password" className={inputCls} value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" required />
                    </div>
                    <div>
                      <label className={labelCls}>Confirm New Password</label>
                      <input type="password" className={inputCls} value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" required />
                    </div>
                    <Msg msg={pwMsg} />
                    <button type="submit" disabled={pwSaving} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm">
                      {pwSaving ? "Changing…" : "Change Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ─── Orders Tab ─── */}
            {tab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-orange-500" /> My Orders
                </h2>

                {ordersLoading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin inline-block w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full" />
                    <p className="mt-3 text-gray-500 text-sm">Loading orders…</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">You have no orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Order row */}
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                              <p className="font-semibold text-gray-800 text-sm">৳{order.totalPrice}</p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <span className="text-xs text-gray-400 hidden sm:block">
                              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            {expandedOrder === order._id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {expandedOrder === order._id && (
                          <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Delivery Address</p>
                                <p className="text-sm text-gray-700">{order.customerAddress}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Contact</p>
                                <p className="text-sm text-gray-700">{order.customerPhone}</p>
                                <p className="text-sm text-gray-500">{order.customerEmail}</p>
                              </div>
                            </div>

                            {/* Items */}
                            <p className="text-xs font-semibold text-gray-500 mb-2">Items ({order.products.length})</p>
                            <div className="space-y-2 mb-4">
                              {order.products.map((p, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-700">{p.title} <span className="text-gray-400">×{p.quantity}</span></span>
                                  <span className="font-semibold text-gray-800">৳{p.price * p.quantity}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-orange-600">৳{order.totalPrice}</span>
                              </div>
                            </div>

                            {/* Cancel button */}
                            {["Pending", "Processing"].includes(order.status) && (
                              <button
                                onClick={() => handleCancel(order._id)}
                                disabled={cancellingId === order._id}
                                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              >
                                {cancellingId === order._id ? "Cancelling…" : "Cancel Order"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {orderPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: orderPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setOrderPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${orderPage === p ? "bg-orange-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-orange-400"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Address Tab ─── */}
            {tab === "address" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" /> Default Address
                </h2>
                <form onSubmit={handleAddressSave} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>City *</label>
                      <input className={inputCls} value={addrForm.city} onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Dhaka" required />
                    </div>
                    <div>
                      <label className={labelCls}>Area / Upazila</label>
                      <input className={inputCls} value={addrForm.area} onChange={(e) => setAddrForm((p) => ({ ...p, area: e.target.value }))} placeholder="e.g. Mirpur" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Address / Special Directions *</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      value={addrForm.address}
                      onChange={(e) => setAddrForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="House no, road no, landmark…"
                      required
                    />
                  </div>
                  <Msg msg={addrMsg} />
                  <button type="submit" disabled={addrSaving} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm">
                    {addrSaving ? "Saving…" : "Save Address"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
