"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Tubira
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering travelers worldwide with seamless, secure, and flexible booking experiences while providing our partners with a transparent and profitable affiliate platform.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://tubira.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Visit Tubira.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-gray-400 hover:text-white transition-colors">
                  Plans
                </Link>
              </li>
              <li>
                <Link href="#benefits" className="text-gray-400 hover:text-white transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href="mailto:partner@tubira.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  partner@tubira.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Support Available</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Tubira. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/admin/login" className="text-gray-400 hover:text-white text-sm transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}