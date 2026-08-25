'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sanitizePincode, validatePincode } from '@/lib/pincode';

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

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDefaults, setUserDefaults] = useState<{ name: string; phone: string }>({ name: '', phone: '' });

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

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const meta = user.user_metadata || {};
        const fullName =
          meta.full_name ||
          meta.name ||
          (meta.given_name ? `${meta.given_name} ${meta.family_name || ''}`.trim() : '') ||
          '';
        const userPhone = meta.phone || user.phone || '';

        setUserDefaults({ name: fullName, phone: userPhone });
        setFormData((prev) => ({
          ...prev,
          name: prev.name || fullName,
          phone: prev.phone || userPhone,
        }));

        const { data } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          const formatted: Address[] = data.map((a: any) => ({
            id: a.id,
            type: (a.label || 'Home') as 'Home' | 'Work',
            name: a.recipient_name,
            phone: a.phone,
            addressLine1: a.address_line_1,
            addressLine2: a.address_line_2 || '',
            city: a.city,
            state: a.state,
            pincode: a.postal_code,
            isDefault: a.is_default,
          }));
          setAddresses(formatted);
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', userId);

    await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', id);

    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from('customer_addresses').delete().eq('id', id);
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!validatePincode(formData.pincode)) {
      showToast('error', 'PIN Code must be exactly 6 digits (starting with 1-9).');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const formattedPhone = formData.phone.startsWith('+91')
      ? formData.phone
      : `+91 ${formData.phone.replace(/\D/g, '')}`;

    if (formData.isDefault) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', userId);
    }

    let saveError = null;

    if (editingId) {
      const { error } = await supabase
        .from('customer_addresses')
        .update({
          label: 'Home',
          recipient_name: formData.name,
          phone: formattedPhone,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pincode,
          is_default: formData.isDefault,
        })
        .eq('id', editingId);

      saveError = error;
    } else {
      const { error } = await supabase.from('customer_addresses').insert({
        customer_id: userId,
        label: 'Home',
        recipient_name: formData.name,
        phone: formattedPhone,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.pincode,
        is_default: formData.isDefault || addresses.length === 0,
      });

      saveError = error;
    }

    setIsSaving(false);

    if (saveError) {
      console.error('[Addresses] Save failed:', saveError);
      showToast('error', `Failed to save address: ${saveError.message}. Please retry.`);
      return;
    }

    showToast('success', 'Address saved successfully.');
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      name: userDefaults.name,
      phone: userDefaults.phone,
      addressLine1: '',
      addressLine2: '',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '',
      type: 'Home',
      isDefault: false,
    });
    loadAddresses();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#C87F4A]/25 shadow-silk flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#C87F4A] animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
          Loading Saved Addresses...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-sans font-medium flex items-center justify-between shadow-md transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
            Delivery Destinations
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Saved Address Book
          </h1>
        </div>

        {!isAddingNew && !editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: userDefaults.name,
                phone: userDefaults.phone,
                addressLine1: '',
                addressLine2: '',
                city: 'Mysuru',
                state: 'Karnataka',
                pincode: '',
                type: 'Home',
                isDefault: false,
              });
              setIsAddingNew(true);
            }}
            className="px-5 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal/Card */}
      {(isAddingNew || editingId) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/30 shadow-2xl space-y-5">
          <h2 className="font-editorial text-xl font-bold text-[#1F1B16] pb-3 border-b border-stone-200">
            {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A]"
                />
              </div>

              <div>
                <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                  Mobile Number *
                </label>
                <div className="flex rounded-xl border border-stone-300 focus-within:border-[#C87F4A] bg-[#FAF3E4]/30 overflow-hidden">
                  <span className="px-3.5 py-2.5 bg-[#FAF3E4] border-r border-stone-300 font-mono font-bold text-[#773D21] flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone.replace(/^\+91\s*/, '')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                Flat, House No., Building, Street Name *
              </label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A]"
              />
            </div>

            <div>
              <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                Landmark, Area, Colony (Optional)
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A]"
                />
              </div>

              <div>
                <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A]"
                />
              </div>

              <div>
                <label className="font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="570001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: sanitizePincode(e.target.value) })}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text');
                    setFormData({ ...formData, pincode: sanitizePincode(pasted) });
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-xl focus:outline-none focus:border-[#C87F4A] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-stone-300 text-[#C87F4A] focus:ring-[#C87F4A]"
                />
                <span className="text-stone-700 font-medium">Set as Default Delivery Address</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                }}
                className="px-5 py-2.5 border border-stone-300 rounded-xl text-stone-600 font-bold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C87F4A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#B36737] shadow-md"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-silk flex flex-col justify-between space-y-4 ${
              addr.isDefault ? 'border-[#C87F4A] ring-2 ring-[#C87F4A]/20' : 'border-stone-200'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Default Delivery Address
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-stone-400">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(addr.id);
                      setFormData({ ...addr });
                    }}
                    className="p-1.5 hover:text-[#C87F4A] rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1F1B16]">{addr.name}</h3>
                <p className="text-xs text-stone-600 font-sans mt-0.5">{addr.phone}</p>
              </div>

              <div className="text-xs text-stone-700 font-sans leading-relaxed pt-2 border-t border-stone-100">
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span>
                </p>
              </div>
            </div>

            {!addr.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefault(addr.id)}
                className="w-full py-2 bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#773D21] text-xs font-sans font-bold rounded-xl transition-all border border-[#C87F4A]/30 cursor-pointer"
              >
                Set as Default Address
              </button>
            )}
          </div>
        ))}
      </div>

      {addresses.length === 0 && !isAddingNew && (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-3">
          <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-[#1F1B16]">No Saved Delivery Addresses</h3>
          <p className="text-xs text-stone-500 font-sans">
            Add a delivery address to complete checkout faster.
          </p>
        </div>
      )}
    </div>
  );
}
