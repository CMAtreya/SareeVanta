'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Video,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Trash2,
  Sparkles,
  Link2,
  X,
  Send,
} from 'lucide-react';

export interface VideoAppointmentItem {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appointment_date: string;
  time_slot: string;
  preferred_weaves: string[];
  occasion?: string;
  platform: string;
  notes?: string;
  meeting_link?: string;
  admin_notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export default function AdminVideoAppointmentsPage() {
  const [appointments, setAppointments] = useState<VideoAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Meeting Link Modal
  const [selectedAppointment, setSelectedAppointment] = useState<VideoAppointmentItem | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchAppointments = () => {
    setLoading(true);
    fetch('/api/admin/video-appointments')
      .then((res) => res.json())
      .then((data) => {
        if (data.appointments && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        } else {
          setAppointments([]);
        }
      })
      .catch((err) => {
        console.error('[Admin Video Appointments] Fetch error:', err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: VideoAppointmentItem['status']) => {
    try {
      const res = await fetch('/api/admin/video-appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      triggerToast(`Appointment marked as ${newStatus}.`);
    } catch (err) {
      console.error('[Admin Video Appointments] Update status error:', err);
      triggerToast('Failed to update status in database.');
    }
  };

  const handleSaveMeetingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/video-appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          meeting_link: meetingLinkInput.trim(),
          admin_notes: adminNotesInput.trim(),
          status: 'CONFIRMED',
        }),
      });

      if (!res.ok) throw new Error('Failed to update meeting details');

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id
            ? {
                ...a,
                meeting_link: meetingLinkInput.trim(),
                admin_notes: adminNotesInput.trim(),
                status: 'CONFIRMED',
              }
            : a
        )
      );

      triggerToast('Meeting link saved and status marked as CONFIRMED.');
      setSelectedAppointment(null);
    } catch (err) {
      console.error('[Admin Video Appointments] Save details error:', err);
      triggerToast('Failed to save meeting details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAppointment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete appointment for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/video-appointments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete appointment');

      setAppointments((prev) => prev.filter((a) => a.id !== id));
      triggerToast(`Appointment for "${name}" deleted.`);
    } catch (err) {
      console.error('[Admin Video Appointments] Delete error:', err);
      triggerToast('Failed to delete appointment.');
    }
  };

  const pendingCount = useMemo(
    () => appointments.filter((a) => a.status === 'PENDING').length,
    [appointments]
  );
  const confirmedCount = useMemo(
    () => appointments.filter((a) => a.status === 'CONFIRMED').length,
    [appointments]
  );
  const completedCount = useMemo(
    () => appointments.filter((a) => a.status === 'COMPLETED').length,
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          a.customer_name.toLowerCase().includes(q) ||
          a.customer_email.toLowerCase().includes(q) ||
          a.customer_phone.includes(q) ||
          (a.occasion && a.occasion.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  return (
    <div className="font-sans text-slate-900 pb-28 space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1F1B16] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C87F4A]/40 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Video Call Consultations
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C87F4A]" />
              <span>Loom Concierge Desk</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Manage live 1-on-1 virtual shopping appointments requested by patrons
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Refresh Consults</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Yet to Tend To (Pending)
          </span>
          <div className="text-2xl font-bold font-mono text-[#7A1C30]">{pendingCount} Requests</div>
          <span className="text-[10px] text-amber-700 font-mono font-semibold block">
            Requires meeting link & confirmation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Confirmed Sessions
          </span>
          <div className="text-2xl font-bold font-mono text-blue-700">{confirmedCount} Bookings</div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Meeting link delivered to patron
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Completed Consults
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700">{completedCount} Orders</div>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold block">
            Successfully concluded on loom
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Total Bookings
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">{appointments.length} Total</div>
          <span className="text-[10px] text-stone-500 font-mono block">
            Direct patron requests
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patron name, phone, email, occasion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#7A1C30]"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Patron Contact</th>
                <th className="p-3.5">Date & Time Window</th>
                <th className="p-3.5">Occasion & Weave Interests</th>
                <th className="p-3.5">Platform & Link</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Loading video appointments from database...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    No video call appointments found in database. All customer bookings will appear here instantly.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patron Contact */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#7A1C30]" />
                        <span>{item.customer_name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{item.customer_phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{item.customer_email}</span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="p-3.5 font-mono text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C87F4A]" />
                        <span>{item.appointment_date}</span>
                      </div>
                      <div className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{item.time_slot}</span>
                      </div>
                    </td>

                    {/* Weaves & Occasion */}
                    <td className="p-3.5 text-xs max-w-xs">
                      <div className="font-semibold text-slate-900">{item.occasion || 'General Curation'}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">
                        {Array.isArray(item.preferred_weaves) && item.preferred_weaves.length > 0
                          ? item.preferred_weaves.join(', ')
                          : 'No specific weave selected'}
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-[#7A1C30] italic mt-0.5">
                          Note: "{item.notes}"
                        </div>
                      )}
                    </td>

                    {/* Platform & Meeting Link */}
                    <td className="p-3.5 text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.platform}</span>
                      </div>
                      {item.meeting_link ? (
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-600 hover:underline mt-0.5"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Open Meeting Link</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-mono block mt-0.5">
                          No link configured
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : item.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : item.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Message */}
                        <a
                          href={`https://wa.me/${item.customer_phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(
                            item.customer_name
                          )}%2C%20greetings%20from%20SareeVanta.%20Regarding%20your%20video%20shopping%20appointment%20on%20${encodeURIComponent(
                            item.appointment_date
                          )}%20(${encodeURIComponent(item.time_slot)}):`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                          title="WhatsApp Patron"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* Configure Link Modal Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppointment(item);
                            setMeetingLinkInput(item.meeting_link || '');
                            setAdminNotesInput(item.admin_notes || '');
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Link / Confirm
                        </button>

                        {/* Status Switcher Dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(item.id, item.customer_name)}
                          className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Add Meeting Link & Confirm */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 bg-gradient-to-r from-[#FAF3E4] to-white border-b border-[#C87F4A]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#7A1C30]" />
                <h2 className="font-bold text-base text-slate-900">
                  Meeting Link & Confirmation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeetingDetails} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <span className="text-stone-500 font-mono block">Patron:</span>
                <span className="font-bold text-sm text-slate-900">
                  {selectedAppointment.customer_name} ({selectedAppointment.customer_phone})
                </span>
                <div className="text-stone-500 font-mono text-[11px] mt-0.5">
                  Scheduled for: {selectedAppointment.appointment_date} at {selectedAppointment.time_slot}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Meet / Zoom / Video Call Link *
                </label>
                <input
                  type="url"
                  required
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-[#7A1C30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Master Draper / Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="e.g. Keep 3 maroon pure silk sarees and 2 mustard katan drapes ready on loom 2."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#7A1C30]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#7A1C30] hover:bg-[#5F1424] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Confirm & Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
