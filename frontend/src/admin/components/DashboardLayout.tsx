"use client";

import ProtectedRoute from '@/admin/components/ProtectedRoute';
import Sidebar from '@/admin/components/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
