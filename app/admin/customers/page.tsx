'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

import { CustomerRecord, SAMPLE_CUSTOMERS } from '@/lib/customers';

export default function CustomerDirectoryPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'ALL' | 'ACTIVE_BUYERS'>('ALL');

  useEffect(() => {
    // Fetch live registered customers strictly from API
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        if (data.customers && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => {
        setCustomers([]);
      });
  }, []);

  const counts = useMemo(() => {
    return {
      ALL: customers.length,
      ACTIVE_BUYERS: customers.filter((c) => c.totalOrders > 0).length,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (activeSegment === 'ACTIVE_BUYERS' && c.totalOrders === 0) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(cleanQ) ||
          c.phone.includes(cleanQ) ||
          c.email.toLowerCase().includes(cleanQ) ||
          c.city.toLowerCase().includes(cleanQ)
        );
      }

      return true;
    });
  }, [customers, activeSegment, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Email',
      'City',
      'State',
      'Country',
      'Total Orders',
      'Total Spend INR',
    ];

    const rows = filteredCustomers.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.country}"`,
      c.totalOrders,
      c.totalSpend,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SareeVanta_Customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Customer Directory
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-[#C87F4A]" />
              <span>{counts.ALL} Registered Clients</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Client Order History & Account Directory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A1C30]" />
            <span>Export Customer CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E8DCC9] shadow-2xs">
        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSegment('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSegment === 'ALL'
                ? 'bg-[#7A1C30] text-white shadow-2xs'
                : 'text-stone-600 hover:bg-[#FAF6F0]'
            }`}
          >
            All Clients ({counts.ALL})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('ACTIVE_BUYERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSegment === 'ACTIVE_BUYERS'
                ? 'bg-[#7A1C30] text-white shadow-2xs'
                : 'text-stone-600 hover:bg-[#FAF6F0]'
            }`}
          >
            Active Buyers ({counts.ACTIVE_BUYERS})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-[#7A1C30] focus:ring-1 focus:ring-[#7A1C30] bg-stone-50/50"
          />
        </div>
      </div>

      {/* Customer Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white border border-[#E8DCC9] rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${customer.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                  >
                    {customer.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1F1B16]">{customer.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>
                        {customer.city}, {customer.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600 font-mono">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <Phone className="w-3 h-3" />
                    <span>Phone</span>
                  </span>
                  <span className="font-semibold text-stone-800">{customer.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </span>
                  <span className="truncate max-w-[170px] text-stone-800">{customer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Total Orders</span>
                  </span>
                  <span className="font-bold text-[#7A1C30]">{customer.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <span>Total Spend</span>
                  </span>
                  <span className="font-bold text-stone-900">₹{customer.totalSpend.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <span>Last Order</span>
                  </span>
                  <span className="text-stone-700 font-semibold">{customer.lastOrderDate || customer.lastActive || 'Registered Recently'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
