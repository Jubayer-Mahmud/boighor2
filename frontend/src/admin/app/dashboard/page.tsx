'use client';

import DashboardLayout from '@/admin/components/DashboardLayout';
import adminService from '@/admin/services/adminService';
import { BarChart3, Box, ShoppingBag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
          adminService.getAllProducts(1, 1),
          adminService.getAllOrders(1, 1),
        ]);

        setStats({
          totalProducts: productsRes.data?.pagination?.total || 0,
          totalOrders: ordersRes.data?.pagination?.total || 0,
          totalUsers: ordersRes.data?.data?.orders?.length || 0,
          pendingOrders: ordersRes.data?.data?.orders?.filter((o: any) => o.status === 'pending').length || 0,
        });
      } catch (err: any) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      icon: <Box className="w-8 h-8" />,
      label: 'Total Products',
      value: stats.totalProducts,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: <Users className="w-8 h-8" />,
      label: 'Active Customers',
      value: stats.totalUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      label: 'Pending Orders',
      value: stats.pendingOrders,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your store overview.</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 animate-pulse h-32"
              >
                <div className="h-12 bg-gray-200 rounded mb-4" />
                <div className="h-6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-4">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/products/add"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <Box className="w-8 h-8 mb-3" />
              <p className="font-semibold">Add Product</p>
              <p className="text-sm text-blue-100 mt-1">Create new book</p>
            </a>
            <a
              href="/admin/products"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <BarChart3 className="w-8 h-8 mb-3" />
              <p className="font-semibold">View Products</p>
              <p className="text-sm text-purple-100 mt-1">Manage inventory</p>
            </a>
            <a
              href="/admin/orders"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <ShoppingBag className="w-8 h-8 mb-3" />
              <p className="font-semibold">View Orders</p>
              <p className="text-sm text-green-100 mt-1">Process orders</p>
            </a>
            <a
              href="/admin/users"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <Users className="w-8 h-8 mb-3" />
              <p className="font-semibold">View Users</p>
              <p className="text-sm text-orange-100 mt-1">Customer list</p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Activity feed will appear here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
