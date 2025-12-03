"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Don't show on admin pages
  const isAdminPage = pathname?.startsWith("/admin");
  
  // Dummy WhatsApp link - replace with actual link later
  const whatsappLink = "https://wa.me/1234567890?text=Hello%20Tubira%20Affiliate%20Team";

  if (isAdminPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Open WhatsApp chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Tubira Support
                </h3>
                <p className="text-white/90 text-xs" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  We're here to help!
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Hi! 👋 Have questions about our affiliate program? Chat with us on WhatsApp!
            </p>
            <Button
              asChild
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-semibold"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open WhatsApp
              </a>
            </Button>
            <p className="text-xs text-gray-500 text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Usually replies within minutes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
