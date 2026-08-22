'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  KeyRound,
  Trash2,
  Edit,
  Mail,
  Phone,
  Clock,
  X,
  Check,
  Layers,
  Settings,
  Receipt,
  Truck,
  CreditCard,
} from 'lucide-react';

export type StaffRole = 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'FULFILLMENT_STAFF' | 'CUSTOMER_CARE';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  lastActive: string;
  twoFactorEnabled: boolean;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Sri Chinmaya Atreya',
    email: 'chinmaya@neelsareehouse.com',
    phone: '+91 98801 12345',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastActive: 'Active right now (Session ID: ssn_8941)',
    twoFactorEnabled: true,
  },
  {
    id: 'staff-2',
    name: 'Ananya Deshpande',
    email: 'ananya@neelsareehouse.com',
    phone: '+91 98450 67890',
    role: 'CATALOG_MANAGER',
    status: 'ACTIVE',
    lastActive: '22 Aug 2026, 04:30 PM',
    twoFactorEnabled: true,
  },
  {
    id: 'staff-3',
    name: 'Ramesh Gowda',
    email: 'ramesh.warehouse@neelsareehouse.com',
    phone: '+91 94480 33445',
    role: 'FULFILLMENT_STAFF',
    status: 'ACTIVE',
    lastActive: '22 Aug 2026, 05:15 PM',
    twoFactorEnabled: true,
  },
  {
    id: 'staff-4',
    name: 'Divya Sundaram',
    email: 'divya.concierge@neelsareehouse.com',
    phone: '+91 99000 88776',
    role: 'CUSTOMER_CARE',
    status: 'ACTIVE',
    lastActive: '22 Aug 2026, 03:50 PM',
    twoFactorEnabled: false,
  },
  {
    id: 'staff-5',
    name: 'Prakash Rao (Mysuru Vault Lead)',
    email: 'prakash.vault@neelsareehouse.com',
    phone: '+91 98860 55443',
    role: 'FULFILLMENT_STAFF',
    status: 'INVITED',
    lastActive: 'Invitation email sent 2 hours ago',
    twoFactorEnabled: false,
  },
];

const ROLES_INFO: Record<
  StaffRole,
  { label: string; badgeColor: string; description: string; permissions: string[] }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
    description: 'Full unrestricted governance across financial payouts, gateway keys, taxes, and staff invitations.',
    permissions: [
      'Manage Store Settings, Taxes & Gateway API Keys',
      'Invite & Revoke Staff Access',
      'View Financial Revenue & P&L Ledgers',
      'Full Product Catalog & Inventory Access',
      'Manage Customer CRM & Orders',
    ],
  },
  CATALOG_MANAGER: {
    label: 'Store & Catalog Manager',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
    description: 'Manages products, collections, hero banners, coupons, and AI avatar matrix. No financial or payout key access.',
    permissions: [
      'Create, Edit, and Archive Saree SKUs',
      'Manage Storefront Banners & Marquee Ticker',
      'Create Promotional Discount Coupons',
      'Manage AI Avatar Virtual Try-On Asset Matrix',
      'No Access to Financial Payouts or Tax Settings',
    ],
  },
  FULFILLMENT_STAFF: {
    label: 'Fulfillment & Dispatch Staff',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    description: 'Access restricted to Orders, BlueDart/Delhivery AWB generation, thermal labels, and warehouse bin stock audits.',
    permissions: [
      'Generate Shipping AWBs & BlueDart Manifests',
      'Print Thermal 4x6 Shipping Labels & GST Invoices',
      'Stock Ledger Count Adjustments (+/-)',
      'Manage Reverse Logistics & QC Inspections',
      'No Customer CRM or Marketing Access',
    ],
  },
  CUSTOMER_CARE: {
    label: 'Customer Care & Bridal Concierge',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    description: 'Access restricted to Patron CRM 360°, order tracking, 1-on-1 video drape scheduling, and WhatsApp messages.',
    permissions: [
      'View Customer 360° Profiles & Order History',
      'Book & Log 1-on-1 Video Drape Appointments',
      'Issue Instant Store Credit Vouchers',
      'Send WhatsApp Order & Shipping Updates',
      'No Inventory Write Access or System Settings',
    ],
  },
};

export default function StaffSettingsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('FULFILLMENT_STAFF');

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim() || '+91 98000 00000',
      role: inviteRole,
      status: 'INVITED',
      lastActive: 'Invitation sent just now',
      twoFactorEnabled: false,
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    triggerToast(`Staff invitation sent to ${inviteEmail}.`);
  };

  const handleRevokeStaff = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access for ${name}?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      triggerToast(`Staff access revoked for ${name}.`);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* SUB-NAV SETTINGS HEADER                            */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Master Configuration & Governance Center
            </h1>
            <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Settings & RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Role-Based Access Control, GST Taxes, Shipping API Credentials & Payment Gateways
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Invite New Staff Member</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* SUB-NAV TABS                                       */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto font-sans text-xs">
        <Link
          href="/admin/settings/staff"
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 shadow-2xs whitespace-nowrap"
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>Staff & RBAC Access</span>
        </Link>
        <Link
          href="/admin/settings/taxes"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Receipt className="w-4 h-4 text-slate-400" />
          <span>Tax, Legal & GST</span>
        </Link>
        <Link
          href="/admin/settings/shipping"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Truck className="w-4 h-4 text-slate-400" />
          <span>Logistics & Warehouses</span>
        </Link>
        <Link
          href="/admin/settings/payments"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>Payment Gateways & Webhooks</span>
        </Link>
      </div>

      {/* ================================================== */}
      {/* 1. STAFF DIRECTORY TABLE                           */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Active Staff & Team Members</h3>
            <p className="text-xs text-slate-500 font-mono">
              {staffList.length} authenticated personnel with access to Neel Saree House administrative consoles
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Assigned RBAC Role</th>
                <th className="p-3.5">Session / Last Active</th>
                <th className="p-3.5 text-center">2FA Security Gate</th>
                <th className="p-3.5 text-center">Account Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {staffList.map((member) => {
                const roleDef = ROLES_INFO[member.role];

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Staff Member */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-300 font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{member.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{member.email}</div>
                          <div className="text-[10px] font-mono text-slate-400">{member.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${roleDef.badgeColor}`}
                      >
                        {roleDef.label}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-slate-800 font-medium">{member.lastActive}</div>
                    </td>

                    {/* 2FA Gate */}
                    <td className="p-3.5 text-center">
                      {member.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>2FA Enforced</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Pending 2FA</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      {member.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeStaff(member.id, member.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Revoke Staff Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. ROLE DEFINITION & PERMISSIONS MATRIX            */}
      {/* ================================================== */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Role Definition & Granular Permissions Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(ROLES_INFO) as StaffRole[]).map((rKey) => {
            const role = ROLES_INFO[rKey];

            return (
              <div
                key={rKey}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${role.badgeColor}`}
                  >
                    {role.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {staffList.filter((s) => s.role === rKey).length} Active Members
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {role.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Granted Permissions:
                  </span>
                  {role.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-sans text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. INVITE NEW STAFF MODAL                          */}
      {/* ================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Invite New Staff Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Smt. Gayatri Hegde"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="gayatri@neelsareehouse.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (for 2FA OTP)
                </label>
                <input
                  type="text"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="+91 98800 11223"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned RBAC Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-medium"
                >
                  <option value="CATALOG_MANAGER">Store & Catalog Manager</option>
                  <option value="FULFILLMENT_STAFF">Fulfillment & Dispatch Staff</option>
                  <option value="CUSTOMER_CARE">Customer Care & Bridal Concierge</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
