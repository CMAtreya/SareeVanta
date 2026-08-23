'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Crown,
  Sparkles,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Globe,
  Heart,
  Video,
  Plus,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

import { CustomerRecord, SAMPLE_CUSTOMERS } from '@/lib/customers';

export default function CustomerDirectoryPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(SAMPLE_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<
    'ALL' | 'VIP' | 'BRIDAL' | 'COD_RISK' | 'NRI'
  >('ALL');

  // Segmentation Counts
  const counts = useMemo(() => {
    return {
      ALL: customers.length,
      VIP: customers.filter((c) => c.totalSpend >= 50000).length,
      BRIDAL: customers.filter((c) => Boolean(c.bridalTag)).length,
      COD_RISK: customers.filter((c) => c.rtoRisk === 'HIGH' || c.rtoRisk === 'MEDIUM').length,
      NRI: customers.filter((c) => c.isNri).length,
    };
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Segment Filter
      if (activeSegment === 'VIP' && c.totalSpend < 50000) return false;
      if (activeSegment === 'BRIDAL' && !c.bridalTag) return false;
      if (activeSegment === 'COD_RISK' && c.rtoRisk === 'LOW') return false;
      if (activeSegment === 'NRI' && !c.isNri) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          c.name.toLowerCase().includes(cleanQ) ||
          c.phone.includes(cleanQ) ||
          c.email.toLowerCase().includes(cleanQ) ||
          c.city.toLowerCase().includes(cleanQ) ||
          (c.bridalTag && c.bridalTag.toLowerCase().includes(cleanQ));

        if (!matches) return false;
      }

      return true;
    });
  }, [customers, activeSegment, searchQuery]);

  // Export CSV
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
      'Bridal Tag',
      'Wedding Date',
      'Tier',
      'RTO Risk',
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
      `"${c.bridalTag || 'N/A'}"`,
      `"${c.weddingDate || 'N/A'}"`,
      `"${c.tier}"`,
      `"${c.rtoRisk}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NeelSareeHouse_VIP_Patrons_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* ================================================== */}
      {/* 1. TOP HEADER & STATS                              */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Client Management & Bridal CRM
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#C87F4A]" />
              <span>{counts.VIP} VIP Patrons (&gt;₹50k Spend)</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Bridal Trousseau Consultations & Patron 360° Profiles
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A1C30]" />
            <span>Export Patrons CSV</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SEARCH & SMART SEGMENTATION TABS                */}
      {/* ================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patron Name, Phone, Email, City, or Wedding Month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF6F0] border border-[#E8DCC9] focus:bg-white focus:border-[#7A1C30] rounded-xl text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div className="text-xs font-mono text-stone-500">
            Showing <strong className="text-stone-900">{filteredCustomers.length}</strong> of{' '}
            {customers.length} Patrons
          </div>
        </div>

        {/* Smart Segment Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { key: 'ALL', label: 'All Patrons', count: counts.ALL },
            { key: 'VIP', label: 'VIP / High Spenders (>₹50k)', count: counts.VIP, icon: Crown },
            {
              key: 'BRIDAL',
              label: 'Bridal Trousseau Shoppers',
              count: counts.BRIDAL,
              icon: Sparkles,
            },
            { key: 'NRI', label: 'Inactive NRI Patrons (US/UK/UAE)', count: counts.NRI, icon: Globe },
            { key: 'COD_RISK', label: 'COD Return Risks', count: counts.COD_RISK, icon: ShieldAlert },
          ].map((seg) => (
            <button
              key={seg.key}
              type="button"
              onClick={() => setActiveSegment(seg.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSegment === seg.key
                  ? 'bg-[#7A1C30] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
              }`}
            >
              {seg.icon && <seg.icon className="w-3.5 h-3.5" />}
              <span>{seg.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeSegment === seg.key
                    ? 'bg-[#5F1424] text-[#E2CE9F]'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {seg.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. CUSTOMER DIRECTORY DATA TABLE                   */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-[#E8DCC9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Patron & Tier</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5">Total Lifetime Spend</th>
                <th className="p-3.5">Bridal / Event Tag</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">360° Dossier</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No clients match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                  >
                    {/* Patron & Tier */}
                    <td className="p-3.5">
                      <Link
                        href={`/admin/customers/${cust.id}`}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${cust.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0 relative`}
                        >
                          {cust.initials}
                          {cust.tier === 'ROYAL_HERITAGE_VIP' && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[8px] font-bold">
                              ★
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            {cust.isNri && (
                              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200">
                                NRI
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-amber-700 font-bold mt-0.5">
                            {cust.tier === 'ROYAL_HERITAGE_VIP'
                              ? 'Royal Heritage VIP'
                              : cust.tier === 'BRIDAL_TROUSSEAU'
                              ? 'Bridal Trousseau VIP'
                              : cust.tier === 'GOLD_PATRON'
                              ? 'Gold Patron'
                              : 'New Client'}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Contact Details */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      <div>{cust.phone}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {cust.email}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900 flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{cust.city}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {cust.state}, {cust.country}
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="p-3.5 text-center font-mono font-bold text-xs text-slate-900">
                      {cust.totalOrders}
                    </td>

                    {/* Total Spend */}
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-slate-900 text-xs">
                        ₹{cust.totalSpend.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        AOV: ₹{Math.round(cust.totalSpend / cust.totalOrders).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Bridal Tag */}
                    <td className="p-3.5">
                      {cust.bridalTag ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>{cust.bridalTag}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {cust.lastActive}
                    </td>

                    {/* 360 Action */}
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/customers/${cust.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <span>Profile 360°</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
