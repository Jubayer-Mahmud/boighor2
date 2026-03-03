"use client";

import { useAuth } from '@/admin/contexts/AuthContext';
import {
  BarChart3,
  Box,
  FolderOpen,
  LogOut,
  Menu,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Sidebar: React.FC = () => {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      href: '/admin/dashboard',
    },
    {
      label: 'Categories',
      icon: FolderOpen,
      href: '/admin/categories',
    },
    {
      label: 'Products',
      icon: Box,
      href: '/admin/products',
      submenu: [
        { label: 'View Products', href: '/admin/products' },
        { label: 'Add Product', href: '/admin/products/add' },
      ],
    },
    {
      label: 'Orders',
      icon: ShoppingBag,
      href: '/admin/orders',
    },
    {
      label: 'Users',
      icon: Users,
      href: '/admin/users',
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 md:hidden bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">BUETian Admin</h1>
          <p className="text-sm text-blue-200 mt-1">Boighor Management</p>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-blue-700">
          <p className="text-sm text-blue-100">Logged as</p>
          <p className="font-semibold truncate">{admin?.name}</p>
          <p className="text-xs text-blue-300">{admin?.email}</p>
          <span className="inline-block mt-2 bg-blue-600 text-xs px-2 py-1 rounded-full">
            {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors active:bg-blue-600"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>

              {/* Submenu */}
              {item.submenu && (
                <div className="ml-4 space-y-1 mt-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.label}
                      href={subitem.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 rounded text-sm text-blue-200 hover:bg-blue-700 transition-colors"
                    >
                      <span>├─ {subitem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
