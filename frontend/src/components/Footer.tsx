"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">� BUETian's BoiGhor</h3>
            <p className="text-sm">Your trusted online bookstore for educational excellence</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-600 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-600 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/admission" className="hover:text-orange-600 transition">
                  Admission
                </Link>
              </li>
              <li>
                <Link href="/category/engineering" className="hover:text-orange-600 transition">
                  Engineering
                </Link>
              </li>
              <li>
                <Link href="/category/medical" className="hover:text-orange-600 transition">
                  Medical
                </Link>
              </li>
              <li>
                <Link href="/category/hsc" className="hover:text-orange-600 transition">
                  HSC
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            <div className="flex gap-4 mb-4">
              <Link href="/" className="hover:text-orange-600 transition">
                <Facebook size={20} />
              </Link>
              <Link href="/" className="hover:text-orange-600 transition">
                <Twitter size={20} />
              </Link>
              <Link href="/" className="hover:text-orange-600 transition">
                <Instagram size={20} />
              </Link>
              <Link href="/" className="hover:text-orange-600 transition">
                <Linkedin size={20} />
              </Link>
            </div>
            <p className="text-sm">📞 +880-1XXX-XXXXXX</p>
            <p className="text-sm">📧 support@buetianboighor.com</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2024 BUETian's BoiGhor. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-orange-600 transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-orange-600 transition">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-orange-600 transition">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
