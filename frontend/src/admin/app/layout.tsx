import type { Metadata } from 'next';
import '../../../app/globals.css';
import { AuthProvider } from '@/admin/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Admin Dashboard - BUETian\'s Boighor',
  description: 'Admin panel for managing BUETian\'s Boighor bookstore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
