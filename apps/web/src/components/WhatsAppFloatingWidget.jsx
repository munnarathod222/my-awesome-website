import React, { useState } from 'react';
import { MessageCircle, X, Send, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCompanyProfile } from '@/lib/companyProfile.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function WhatsAppFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const location = useLocation();
  const company = useCompanyProfile();
  const { isAuthenticated } = useAuth();

  // Hide completely after user logs in (only for public customers on landing pages)
  if (isAuthenticated) return null;

  // Only display on public customer landing & informational pages
  const customerLandingPages = ['/', '/services', '/about', '/contact', '/quote', '/tracking', '/track', '/track-shipment'];
  const isLandingPage = customerLandingPages.includes(location.pathname);
  if (!isLandingPage) return null;

  // Extract digits from Company Settings phone number
  const rawPhone = company.company_phone || company.phone || '9346298466';
  const cleanDigits = rawPhone.replace(/\D/g, '');
  const phone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const companyName = company.company_name || 'Jai Bhavani Cargo';

  const quickOptions = [
    { label: '🚛 Book a Truck / Freight Quote', text: `Hello ${companyName}, I would like to get a freight transport quote for a truck.` },
    { label: '📦 Track My Shipment', text: `Hello ${companyName}, I would like to track my ongoing shipment.` },
    { label: '👤 Driver & Jobs Inquiry', text: `Hello ${companyName}, I am interested in driver / job opportunities.` },
  ];

  const handleSend = (textToSend) => {
    const message = textToSend || customMsg || `Hello ${companyName}, I have an inquiry.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="mb-3 w-[320px] sm:w-[360px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden">
                  {company.company_logo ? (
                    <img src={company.company_logo} alt={companyName} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Truck className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5 truncate max-w-[190px]">
                  {companyName}
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                </h4>
                <p className="text-[11px] text-emerald-100/90 font-medium">Online • {company.company_phone || '+91 7794072244'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-white/90 hover:text-white transition-colors"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-slate-950/90 space-y-3">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-200 leading-relaxed shadow-sm">
              <p className="font-semibold text-white mb-1">Namaste! 👋</p>
              <p>How can we assist your logistics and transportation needs today?</p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Quick Inquiries</p>
              {quickOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(opt.text)}
                  className="w-full text-left text-xs bg-slate-900/60 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-slate-800 rounded-xl p-2.5 text-slate-300 hover:text-emerald-300 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{opt.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(customMsg);
              }}
              className="pt-2 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a message on WhatsApp..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-transform active:scale-95 shrink-0 flex items-center justify-center"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 text-white border border-slate-700'
            : 'bg-[#25D366] text-white hover:bg-[#20ba59] shadow-emerald-500/30'
        }`}
        aria-label="Open WhatsApp live chat"
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
          </span>
        )}
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
        )}
      </button>
    </div>
  );
}
