'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function VisitUsPage() {
  const [booked, setBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Heritage Flagship Destination</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1F1B16]">
            Visit Our Mysuru Heritage Salon
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mt-2">
            Experience our 1984 flagship boutique on Sayyaji Rao Road with personalized master draper appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Salon Details Card */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-[#C87F4A]/25 shadow-silk-lg space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner border border-[#C87F4A]/20">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                alt="Mysuru Flagship Salon"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5 text-white">
                <span className="font-editorial text-xl font-bold">Sayyaji Rao Road Flagship</span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-sans text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C87F4A] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Neelsareehouse Flagship Salon:</strong> <br />
                  #104/A, Sayyaji Rao Road, Opp. Royal Palace Northern Gate, Mysuru, Karnataka 570001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>Open Daily: 10:30 AM – 8:30 PM (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>Salon Desk: +91 821 242 3344</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>concierge@neelsareehouse.com</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF3E4] rounded-2xl border border-[#C87F4A]/25 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1F1B16] block">Need Assistance or Directions?</span>
                <span className="text-[10px] text-stone-500 font-sans">Our Mysuru salon concierge is here to help.</span>
              </div>
              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#C87F4A] text-white text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Appointment Booking Form */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-[#C87F4A]/25 shadow-silk-lg space-y-6">
            <h2 className="font-editorial text-2xl font-bold text-[#1F1B16] pb-3 border-b border-stone-100">
              Schedule an In-Salon Boutique Visit
            </h2>

            {booked ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                  Salon Visit Confirmed
                </h3>
                <p className="text-xs text-stone-600 font-sans max-w-sm mx-auto">
                  A dedicated master sari draper has been reserved for your flagship visit. You will receive an SMS and WhatsApp confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div className="p-3 rounded-xl border border-[#C87F4A] bg-[#FAF3E4] text-center">
                  <span className="text-xs block font-bold text-[#1F1B16]">In-Salon Flagship Boutique Visit</span>
                  <span className="text-[10px] text-stone-500 font-normal">Sayyaji Rao Road, Opp. Royal Palace, Mysuru</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meenakshi Sundaram"
                    className="w-full px-3.5 py-2.5 bg-[#FAF3E4] border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98860 12345"
                    className="w-full px-3.5 py-2.5 bg-[#FAF3E4] border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF3E4] border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Preferred Time</label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-[#FAF3E4] border border-stone-300 rounded-lg text-xs"
                    >
                      <option>11:00 AM – 12:00 PM</option>
                      <option>02:00 PM – 03:00 PM</option>
                      <option>04:30 PM – 05:30 PM</option>
                      <option>07:00 PM – 08:00 PM</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest shadow-md transition-all"
                >
                  Confirm Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
