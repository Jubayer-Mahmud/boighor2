"use client";

import DashboardLayout from '@/admin/components/DashboardLayout';
import adminService from '@/admin/services/adminService';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Get users from orders
      const response = await adminService.getAllOrders(currentPage, 10);
      
      // Extract unique users from orders
      const uniqueUsers: Record<string, User> = {};
      response.data.orders?.forEach((order: any) => {
        if (order.user && !uniqueUsers[order.user._id]) {
          uniqueUsers[order.user._id] = {
            _id: order.user._id,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone || 'N/A',
            city: 'N/A',
            createdAt: order.createdAt,
          };
        }
      });

      setUsers(Object.values(uniqueUsers));
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customers</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <p className="mt-4 text-gray-600">Loading customers...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{user.city}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            disabled
                            className="text-gray-400 cursor-not-allowed"
                            title="Messaging coming soon"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t px-6 py-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">With Phone</h3>
            <p className="text-3xl font-bold text-green-600">
              {users.filter((u) => u.phone !== 'N/A').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">With Location</h3>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.city !== 'N/A').length}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
