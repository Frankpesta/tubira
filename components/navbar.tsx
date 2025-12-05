"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* Mobile Logo */}
            <Image
              src="/logo-mobile.jpg"
              alt="Tubira"
              width={120}
              height={40}
              className="md:hidden h-10 w-auto"
              priority
            />
            {/* Desktop Logo */}
            <Image
              src="/logo-full.jpg"
              alt="Tubira"
              width={150}
              height={50}
              className="hidden md:block h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#about"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="#plans"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Plans
            </Link>
            <Link
              href="#benefits"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Benefits
            </Link>
            <Link
              href="#faq"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              FAQ
            </Link>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="#about"
              className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#plans"
              className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Plans
            </Link>
            <Link
              href="#benefits"
              className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Benefits
            </Link>
            <Link
              href="#faq"
              className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

