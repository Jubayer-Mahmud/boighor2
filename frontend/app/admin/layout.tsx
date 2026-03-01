import type { Metadata } from 'next';
import '../globals.css';
import { AuthProvider } from '@/admin/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Admin Dashboard - BUETian\'s Boighor',
  description: 'Admin panel for managing BUETian\'s Boighor bookstore',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
