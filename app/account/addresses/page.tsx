'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, Check, ShieldCheck } from 'lucide-react';

interface Address {
  id: string;
  type: 'Home' | 'Work';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    type: 'Home',
    name: 'Ananya S. Rao',
    phone: '+91 98860 12345',
    addressLine1: '42, Royal Palms Residency, Sayyaji Rao Road',
    addressLine2: 'Near Mysore Palace North Gate',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'Work',
    name: 'Ananya S. Rao',
    phone: '+91 98860 12345',
    addressLine1: 'Level 4, Prestige Meridian, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: false,
  },
];

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    type: 'Home' | 'Work';
    isDefault: boolean;
  }>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '',
    type: 'Home',
    isDefault: false,
  });

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAddresses(
        addresses.map((a) => (a.id === editingId ? { ...a, ...formData } : a))
      );
      setEditingId(null);
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        ...formData,
      };
      if (newAddr.isDefault) {
        setAddresses([newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))]);
      } else {
        setAddresses([...addresses, newAddr]);
      }
    }
    setIsAddingNew(false);
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '',
      type: 'Home',
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-1">
            Dispatch Registry
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Saved Address Book
          </h1>
          <span className="text-xs text-stone-500 font-sans block mt-1">
            Manage your verified delivery locations for priority insured BlueDart transit.
          </span>
        </div>

        {!isAddingNew && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setIsAddingNew(true);
            }}
            className="px-4 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAddingNew && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/30 shadow-silk space-y-4 text-xs font-sans animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="font-editorial text-lg font-bold text-[#1F1B16]">
              {editingId ? 'Edit Delivery Address' : 'Enter New Delivery Address'}
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-stone-500 hover:text-black font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Radhika Sundaram"
                className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98860 12345"
                className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="e.g. 14/B, Heritage Villa, Sayyaji Rao Road"
              className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="570001"
                className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl font-mono font-bold text-center"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="default-check"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="accent-[#C87F4A] w-4 h-4 rounded"
            />
            <label htmlFor="default-check" className="text-xs text-stone-700 cursor-pointer">
              Set as primary default delivery address
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1F1B16] hover:bg-black text-white py-3 rounded-xl font-bold uppercase tracking-wider"
          >
            Save Address
          </button>
        </form>
      )}

      {/* Address Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white rounded-3xl p-6 border border-[#C87F4A]/25 shadow-silk space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1F1B16]">{addr.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FAF3E4] text-[#773D21] font-semibold border border-[#C87F4A]/20">
                    {addr.type}
                  </span>
                </div>

                {addr.isDefault && (
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                    Default
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
              </p>

              <span className="text-xs font-mono text-stone-500 block">
                Mobile: {addr.phone}
              </span>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-sans">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-stone-500 hover:text-[#C87F4A] text-[11px] font-medium"
                >
                  Set as Default
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(addr);
                    setEditingId(addr.id);
                    setIsAddingNew(true);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#C87F4A] hover:bg-[#FAF3E4] transition-colors"
                  aria-label="Edit Address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
