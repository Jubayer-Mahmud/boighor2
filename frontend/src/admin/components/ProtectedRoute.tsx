'use client';

import { useAuth } from '@/admin/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !admin) && isMounted) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, admin, isLoading, router, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Verify admin is authenticated and has valid admin role
  if (!isAuthenticated || !admin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
