'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  QrCode,
  ShieldCheck,
  Send,
  Eye,
  SlidersHorizontal,
  X,
  FileText,
  Boxes,
  Compass,
  ArrowUpRight,
  RefreshCw,
  Share2,
} from 'lucide-react';

export interface ShipmentItem {
  title: string;
  weave: string;
  sku: string;
  price: number;
  qty: number;
  image: string;
  zari: string;
  weightGrams: number;
}

export interface TrackingCheckpoint {
  time: string;
  date: string;
  location: string;
  activity: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
}

export interface ShipmentRecord {
  id: string;
  awb: string;
  orderId: string;
  dateCreated: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  carrier: 'Blue Dart Air Express' | 'Delhivery Air' | 'DHL Express Global';
  carrierServiceCode: string;
  shipmentType: 'AIR_EXPRESS' | 'SURFACE_SECURE';
  status:
    | 'MANIFEST_GENERATED'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'NDR_PENDING'
    | 'RTO_INITIATED';
  currentLocation: string;
  latestCheckpointText: string;
  estimatedDelivery: string;
  items: ShipmentItem[];
  totalValueINR: number;
  totalWeightGrams: number;
  silkMarkAuditId: string;
  paymentMode: 'PREPAID' | 'COD';
  ndrReason?: string;
  trackingHistory: TrackingCheckpoint[];
}

const INITIAL_SHIPMENTS: ShipmentRecord[] = [
  {
    id: 'SHP-2026-0841',
    awb: 'BD-BLR-884920',
    orderId: 'NSH-2026-8941',
    dateCreated: '23 Aug 2026, 09:30 AM',
    customerName: 'Dr. Ananya Rao',
    phone: '+91 98450 12345',
    email: 'ananya.rao@hospital.org',
    address: 'Villa 14, Prestige Ozone, Whitefield Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    carrier: 'Blue Dart Air Express',
    carrierServiceCode: 'BD-DOM-AIR-01',
    shipmentType: 'AIR_EXPRESS',
    status: 'PICKED_UP',
    currentLocation: 'Mysuru Origin Hub (Devaraja Sort Facility)',
    latestCheckpointText: 'Handed over to Blue Dart Express Van at Mysore Weave Studio',
    estimatedDelivery: '24 Aug 2026 (Tomorrow)',
    items: [
      {
        title: 'Royal Wodeyar Crimson Crepe Silk',
        weave: 'Mysore Silk',
        sku: 'NSH-SKU-MYS-01',
        price: 28500,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
        zari: '24K Tested Pure Zari',
        weightGrams: 680,
      },
    ],
    totalValueINR: 28500,
    totalWeightGrams: 680,
    silkMarkAuditId: 'CSB-2026-MYS-8942',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '23 Aug 2026',
        time: '09:30 AM',
        location: 'Mysuru Artisan Vault',
        activity: 'Air Parcel packed with archival muslin cloth & Silk Mark certificate sealed',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '11:15 AM',
        location: 'Mysuru Origin Sort Hub',
        activity: 'Inward scan completed. AWB BD-BLR-884920 assigned to Blue Dart Air Express',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '02:45 PM',
        location: 'BLR Airport Gateway Hub',
        activity: 'In-transit to Bengaluru Airport Air Freight Gateway',
        status: 'CURRENT',
      },
      {
        date: '24 Aug 2026',
        time: 'Expected 10:00 AM',
        location: 'Whitefield Delivery Station',
        activity: 'Out for Delivery to Patron Residence',
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'SHP-2026-0840',
    awb: 'BD-HYD-773821',
    orderId: 'NSH-2026-8940',
    dateCreated: '22 Aug 2026, 04:15 PM',
    customerName: 'Smt. Radhika Reddy',
    phone: '+91 99890 98765',
    email: 'radhika.reddy@gmail.com',
    address: 'Bungalow 7, Road No 36, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    carrier: 'Blue Dart Air Express',
    carrierServiceCode: 'BD-DOM-AIR-01',
    shipmentType: 'AIR_EXPRESS',
    status: 'IN_TRANSIT',
    currentLocation: 'Hyderabad Airport Gateway Hub (RGIA Cargo)',
    latestCheckpointText: 'Flight BD-604 arrived at RGIA Cargo Terminal; sort underway',
    estimatedDelivery: '24 Aug 2026 (Tomorrow)',
    items: [
      {
        title: 'Bridal Kanchipuram Korvai Gold Brocade',
        weave: 'Kanchipuram',
        sku: 'NSH-SKU-KAN-04',
        price: 68000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
        zari: 'Sacred 3-Shuttle Pure Gold Zari',
        weightGrams: 920,
      },
      {
        title: 'Champagne Tissue Georgette Floral Zari',
        weave: 'Tissue Georgette',
        sku: 'NSH-SKU-TIS-08',
        price: 36000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
        zari: 'Lightweight Tested Zari',
        weightGrams: 520,
      },
    ],
    totalValueINR: 104000,
    totalWeightGrams: 1440,
    silkMarkAuditId: 'CSB-2026-KAN-1102',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '22 Aug 2026',
        time: '04:15 PM',
        location: 'Mysuru Artisan Vault',
        activity: 'Double-boxed luxury bridal packing verified by Master Draper',
        status: 'COMPLETED',
      },
      {
        date: '22 Aug 2026',
        time: '08:30 PM',
        location: 'BLR Kempegowda Airport Hub',
        activity: 'Loaded onto Blue Dart Boeing 737 Air Cargo Freight',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '01:10 PM',
        location: 'RGIA Hyderabad Cargo Hub',
        activity: 'Flight arrived. Airway bill sorting initiated for Jubilee Hills station',
        status: 'CURRENT',
      },
      {
        date: '24 Aug 2026',
        time: 'Expected 11:30 AM',
        location: 'Jubilee Hills Hub',
        activity: 'Out for Delivery with dedicated luxury courier agent',
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'SHP-2026-0839',
    awb: 'BD-MUM-119283',
    orderId: 'NSH-2026-8939',
    dateCreated: '22 Aug 2026, 01:45 PM',
    customerName: 'Meera Deshmukh',
    phone: '+91 98200 44556',
    email: 'meera.deshmukh@outlook.com',
    address: 'Flat 402, Sea Green Apts, Perry Cross Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    carrier: 'Blue Dart Air Express',
    carrierServiceCode: 'BD-DOM-AIR-01',
    shipmentType: 'AIR_EXPRESS',
    status: 'OUT_FOR_DELIVERY',
    currentLocation: 'Bandra West Delivery Station, Mumbai',
    latestCheckpointText: 'Out with Courier Rider Amit Sharma (+91 98190 22334); OTP generated',
    estimatedDelivery: '23 Aug 2026 (Today by 04:00 PM)',
    items: [
      {
        title: 'Yeola Paithani Royal Peacock Asawali',
        weave: 'Paithani',
        sku: 'NSH-SKU-PAI-02',
        price: 46000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
        zari: 'Tapestry Pure Zari',
        weightGrams: 740,
      },
    ],
    totalValueINR: 46000,
    totalWeightGrams: 740,
    silkMarkAuditId: 'CSB-2026-PAI-9920',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '22 Aug 2026',
        time: '01:45 PM',
        location: 'Mysuru Weave Studio',
        activity: 'Parcel sealed and insured under Blue Dart High-Value Handloom Cargo',
        status: 'COMPLETED',
      },
      {
        date: '22 Aug 2026',
        time: '11:45 PM',
        location: 'Mumbai Air Cargo Hub',
        activity: 'Received at Mumbai Sahar Domestic Airport sorting terminal',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '08:20 AM',
        location: 'Bandra West Station',
        activity: 'Bagged for route delivery. Assigned to Courier Rider Amit Sharma',
        status: 'CURRENT',
      },
    ],
  },
  {
    id: 'SHP-2026-0838',
    awb: 'DL-DEL-559281',
    orderId: 'NSH-2026-8938',
    dateCreated: '21 Aug 2026, 07:30 PM',
    customerName: 'Pooja Singhania',
    phone: '+91 98110 33445',
    email: 'pooja.singhania@heritage.in',
    address: 'B-14, Golf Links, Near Khan Market',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110003',
    carrier: 'Delhivery Air',
    carrierServiceCode: 'DL-AIR-EXP-PRIORITY',
    shipmentType: 'AIR_EXPRESS',
    status: 'DELIVERED',
    currentLocation: 'Delivered at Golf Links, New Delhi',
    latestCheckpointText: 'Delivered to Patron (Signed by Pooja Singhania; Digital Signature Captured)',
    estimatedDelivery: '23 Aug 2026 (Delivered)',
    items: [
      {
        title: 'Varanasi Shikargah Antique Gold Brocade',
        weave: 'Banarasi',
        sku: 'NSH-SKU-BAN-07',
        price: 52000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
        zari: 'Kadhwa Weave Tested Zari',
        weightGrams: 890,
      },
    ],
    totalValueINR: 52000,
    totalWeightGrams: 890,
    silkMarkAuditId: 'CSB-2026-BAN-5401',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '21 Aug 2026',
        time: '07:30 PM',
        location: 'Mysuru Studio',
        activity: 'Parcel Manifested for Delhi Air Express',
        status: 'COMPLETED',
      },
      {
        date: '22 Aug 2026',
        time: '09:00 PM',
        location: 'IGI Airport Terminal 3 Hub, Delhi',
        activity: 'Arrived at Delhi Inward Distribution Center',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '11:45 AM',
        location: 'Golf Links, New Delhi',
        activity: 'Delivered successfully to recipient',
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'SHP-2026-0837',
    awb: 'BD-CHE-339201',
    orderId: 'NSH-2026-8937',
    dateCreated: '21 Aug 2026, 04:00 PM',
    customerName: 'Kavitha Sundaram',
    phone: '+91 94440 88990',
    email: 'kavitha.sundaram@tcs.com',
    address: 'Flat 3B, Ceebros Heritage, Boat Club Road, R.A. Puram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    carrier: 'Blue Dart Air Express',
    carrierServiceCode: 'BD-DOM-AIR-01',
    shipmentType: 'AIR_EXPRESS',
    status: 'NDR_PENDING',
    currentLocation: 'R.A. Puram Hub, Chennai',
    latestCheckpointText: 'Non-Delivery Exception: Customer requested evening delivery after 07:00 PM',
    estimatedDelivery: '23 Aug 2026 (Re-attempt at 07:30 PM)',
    ndrReason: 'Customer Unreachable on 1st Attempt / Rescheduled to Evening Slot',
    items: [
      {
        title: 'Mysore Silk Gold Tissue Kasuti Border',
        weave: 'Mysore Silk',
        sku: 'NSH-SKU-MYS-03',
        price: 24000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
        zari: 'Tested 24K Kasuti Zari',
        weightGrams: 640,
      },
    ],
    totalValueINR: 24000,
    totalWeightGrams: 640,
    silkMarkAuditId: 'CSB-2026-MYS-4410',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '21 Aug 2026',
        time: '04:00 PM',
        location: 'Mysuru Artisan Studio',
        activity: 'Parcel packed and sealed with security tamper tape',
        status: 'COMPLETED',
      },
      {
        date: '22 Aug 2026',
        time: '06:30 AM',
        location: 'Chennai Airport Cargo Hub',
        activity: 'Received at Chennai hub; sorted for R.A. Puram branch',
        status: 'COMPLETED',
      },
      {
        date: '23 Aug 2026',
        time: '01:30 PM',
        location: 'R.A. Puram Delivery Office',
        activity: 'Delivery attempted; patron requested re-dispatch post 7 PM',
        status: 'CURRENT',
      },
    ],
  },
  {
    id: 'SHP-2026-0836',
    awb: 'DL-CCU-992810',
    orderId: 'NSH-2026-8936',
    dateCreated: '20 Aug 2026, 05:20 PM',
    customerName: 'Arundhati Sen',
    phone: '+91 98300 77665',
    email: 'arundhati.sen@calcuttauniv.ac.in',
    address: 'Flat 2A, Ballygunge Circular Road, Near Military Camp',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700019',
    carrier: 'Delhivery Air',
    carrierServiceCode: 'DL-AIR-EXP-PRIORITY',
    shipmentType: 'AIR_EXPRESS',
    status: 'MANIFEST_GENERATED',
    currentLocation: 'Mysuru Central Weaving Workshop',
    latestCheckpointText: 'Manifest generated & 4x6" thermal barcode label affixed; awaiting van pickup',
    estimatedDelivery: '25 Aug 2026',
    items: [
      {
        title: 'Patan Patola Double Ikkat Navratna Silk',
        weave: 'Patola',
        sku: 'NSH-SKU-PAT-01',
        price: 85000,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
        zari: 'Heritage Silk Weave',
        weightGrams: 810,
      },
    ],
    totalValueINR: 85000,
    totalWeightGrams: 810,
    silkMarkAuditId: 'CSB-2026-PAT-9011',
    paymentMode: 'PREPAID',
    trackingHistory: [
      {
        date: '20 Aug 2026',
        time: '05:20 PM',
        location: 'Mysuru Studio',
        activity: 'Handloom quality check passed; manifest created',
        status: 'COMPLETED',
      },
    ],
  },
];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>(INITIAL_SHIPMENTS);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Modal States
  const [activeTrackingShipment, setActiveTrackingShipment] = useState<ShipmentRecord | null>(null);
  const [activeLabelShipment, setActiveLabelShipment] = useState<ShipmentRecord | null>(null);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [isSchedulePickupModalOpen, setIsSchedulePickupModalOpen] = useState(false);
  const [pickupCarrier, setPickupCarrier] = useState('Blue Dart Air Express');
  const [pickupSlot, setPickupSlot] = useState('EVENING_04_06PM');
  const [pickupSuccessToast, setPickupSuccessToast] = useState(false);

  // Copy AWB feedback
  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((shp) => {
      // Status Filter
      if (selectedStatusTab === 'SCHEDULED' && shp.status !== 'MANIFEST_GENERATED' && shp.status !== 'PICKED_UP') {
        return false;
      }
      if (selectedStatusTab === 'IN_TRANSIT' && shp.status !== 'IN_TRANSIT') {
        return false;
      }
      if (selectedStatusTab === 'OUT_FOR_DELIVERY' && shp.status !== 'OUT_FOR_DELIVERY') {
        return false;
      }
      if (selectedStatusTab === 'DELIVERED' && shp.status !== 'DELIVERED') {
        return false;
      }
      if (selectedStatusTab === 'NDR' && shp.status !== 'NDR_PENDING') {
        return false;
      }

      // Carrier Filter
      if (selectedCarrier !== 'ALL' && shp.carrier !== selectedCarrier) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAwb = shp.awb.toLowerCase().includes(q);
        const matchesOrder = shp.orderId.toLowerCase().includes(q);
        const matchesCustomer = shp.customerName.toLowerCase().includes(q);
        const matchesCity = shp.city.toLowerCase().includes(q);
        const matchesPincode = shp.pincode.includes(q);
        const matchesSku = shp.items.some((item) => item.sku.toLowerCase().includes(q) || item.title.toLowerCase().includes(q));

        if (!matchesAwb && !matchesOrder && !matchesCustomer && !matchesCity && !matchesPincode && !matchesSku) {
          return false;
        }
      }

      return true;
    });
  }, [shipments, selectedStatusTab, selectedCarrier, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
    const outForDelivery = shipments.filter((s) => s.status === 'OUT_FOR_DELIVERY').length;
    const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
    const ndr = shipments.filter((s) => s.status === 'NDR_PENDING').length;
    const readyPickup = shipments.filter((s) => s.status === 'MANIFEST_GENERATED' || s.status === 'PICKED_UP').length;
    const totalInsuredValue = shipments.reduce((acc, s) => acc + s.totalValueINR, 0);

    return { total, inTransit, outForDelivery, delivered, ndr, readyPickup, totalInsuredValue };
  }, [shipments]);

  // Handle Dispatch / Re-attempt Action
  const handleResolveNdr = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              status: 'OUT_FOR_DELIVERY',
              latestCheckpointText: 'Patron re-scheduled request confirmed for 07:30 PM evening run',
              trackingHistory: [
                ...s.trackingHistory,
                {
                  date: '23 Aug 2026',
                  time: '04:00 PM',
                  location: `${s.city} Station`,
                  activity: 'Admin dispatched special evening delivery run with OTP confirmation',
                  status: 'CURRENT',
                },
              ],
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6 pb-20 text-slate-900 font-sans">
      {/* 1. TOP HEADER & LOGISTICS ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#7A1C30] mb-1">
            <Truck className="w-4 h-4 text-[#7A1C30]" />
            <span>Air Express & Surface Dispatch Center</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900">
            Shipments & Courier Logistics
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time Blue Dart Air & Delhivery AWB synchronization for authentic handloom silk deliveries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSchedulePickupModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Schedule Courier Pickup</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManifestModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Dispatch Manifest</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {pickupSuccessToast && (
        <div className="bg-emerald-900 text-emerald-100 p-4 rounded-2xl border border-emerald-700 flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-sans font-semibold">
              Courier Pickup Request Booked Successfully! Blue Dart Van assigned for Mysuru Studio at 04:30 PM.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPickupSuccessToast(false)}
            className="text-emerald-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total Active</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-editorial text-slate-900">{stats.total}</div>
          <div className="text-[10px] font-mono text-slate-400">All Registered AWBs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-semibold">Ready for Pickup</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-editorial text-amber-900">{stats.readyPickup}</div>
          <div className="text-[10px] font-mono text-amber-600">Manifest Sealed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-semibold">In Air Transit</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-editorial text-blue-900">{stats.inTransit}</div>
          <div className="text-[10px] font-mono text-blue-600">Flight & Cargo Hubs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[11px] font-semibold">Out for Delivery</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-editorial text-indigo-900">{stats.outForDelivery}</div>
          <div className="text-[10px] font-mono text-indigo-600">OTP Dispatches Today</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-semibold">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-editorial text-emerald-900">{stats.delivered}</div>
          <div className="text-[10px] font-mono text-emerald-600">Patron Verified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-semibold">Exceptions / NDR</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-editorial text-rose-900">{stats.ndr}</div>
          <div className="text-[10px] font-mono text-rose-600">Re-attempt Action Needed</div>
        </div>
      </div>

      {/* 3. CONTROLS, SEARCH, AND FILTERS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Shipments', count: stats.total },
            { id: 'SCHEDULED', label: 'Ready for Pickup', count: stats.readyPickup },
            { id: 'IN_TRANSIT', label: 'In Transit', count: stats.inTransit },
            { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: stats.outForDelivery },
            { id: 'DELIVERED', label: 'Delivered', count: stats.delivered },
            { id: 'NDR', label: 'NDR / Exceptions', count: stats.ndr, isWarning: true },
          ].map((tab) => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#7A1C30] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isWarning && tab.count > 0
                      ? 'bg-rose-100 text-rose-700 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Carrier Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by AWB tracking number, Order ID, patron name, destination city, or PIN code..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Logistics Carriers</option>
              <option value="Blue Dart Air Express">Blue Dart Air Express</option>
              <option value="Delhivery Air">Delhivery Air</option>
              <option value="DHL Express Global">DHL Express Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. SHIPMENTS DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">AWB & Carrier</th>
                <th className="py-3.5 px-4 font-semibold">Order & Patron</th>
                <th className="py-3.5 px-4 font-semibold">Saree Item & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Destination</th>
                <th className="py-3.5 px-4 font-semibold">Status & Checkpoint</th>
                <th className="py-3.5 px-4 font-semibold">Est. Delivery</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No shipments found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search queries</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shp) => {
                  return (
                    <tr key={shp.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* 1. AWB & Carrier */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                            <span>{shp.awb}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAwb(shp.awb)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title="Copy AWB Number"
                            >
                              {copiedAwb === shp.awb ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{shp.carrier}</span>
                          </div>

                          <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider text-[#7A1C30] bg-[#FAF3E4] px-2 py-0.2 rounded border border-[#C87F4A]/30">
                            {shp.shipmentType === 'AIR_EXPRESS' ? '✈ Air Cargo Priority' : '🚚 Surface Secure'}
                          </span>
                        </div>
                      </td>

                      {/* 2. Order & Patron */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/orders/${shp.orderId}`}
                            className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{shp.orderId}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                          <div className="font-semibold text-slate-900">{shp.customerName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{shp.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Saree Item & SKU */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 max-w-[220px]">
                          {shp.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-8 h-10 rounded-md object-cover border border-slate-200 flex-shrink-0"
                              />
                              <div className="truncate">
                                <div className="font-semibold text-slate-800 text-[11px] truncate">
                                  {item.title}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {item.sku} • {item.weightGrams}g
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="text-[10px] font-mono text-emerald-700 font-semibold pt-0.5">
                            ₹{shp.totalValueINR.toLocaleString('en-IN')} (Insured)
                          </div>
                        </div>
                      </td>

                      {/* 4. Destination */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5 max-w-[180px]">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#7A1C30] flex-shrink-0" />
                            <span>{shp.city}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">PIN: {shp.pincode}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{shp.address}</div>
                        </div>
                      </td>

                      {/* 5. Status & Checkpoint */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5 max-w-[200px]">
                          <div>
                            {shp.status === 'PICKED_UP' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Picked Up by Courier
                              </span>
                            )}
                            {shp.status === 'IN_TRANSIT' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                In Air Transit
                              </span>
                            )}
                            {shp.status === 'OUT_FOR_DELIVERY' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Out for Delivery
                              </span>
                            )}
                            {shp.status === 'DELIVERED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Delivered
                              </span>
                            )}
                            {shp.status === 'NDR_PENDING' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                NDR Exception
                              </span>
                            )}
                            {shp.status === 'MANIFEST_GENERATED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                Manifest Sealed
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                            {shp.latestCheckpointText}
                          </p>

                          {shp.status === 'NDR_PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleResolveNdr(shp.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              <span>Trigger Evening Re-attempt</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 6. Est. Delivery */}
                      <td className="py-4 px-4 align-top font-mono text-slate-800">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">{shp.estimatedDelivery}</div>
                          <div className="text-[10px] text-slate-400">Created: {shp.dateCreated.split(',')[0]}</div>
                        </div>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveTrackingShipment(shp)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Compass className="w-3 h-3" />
                            <span>Track Live</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveLabelShipment(shp)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>4×6" Label</span>
                          </button>

                          <a
                            href={`https://wa.me/${shp.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Namaste ${shp.customerName}, your Neel Saree House pure handloom silk order (${shp.orderId}) has been dispatched via ${shp.carrier} (AWB: ${shp.awb}). Live tracking: https://neelsareehouse.com/account/orders`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>WhatsApp Alert</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: LIVE TRACKING TIMELINE DRAWER / MODAL            */}
      {/* ========================================================= */}
      {activeTrackingShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7A1C30]">
                  Live Carrier GPS Checkpoints
                </span>
                <h3 className="font-editorial text-xl font-bold text-slate-900">
                  AWB Tracking: {activeTrackingShipment.awb}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrackingShipment(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Carrier Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">Logistics Carrier</div>
                <div className="text-sm font-bold text-slate-900">{activeTrackingShipment.carrier}</div>
                <div className="text-[11px] font-mono text-slate-500">{activeTrackingShipment.carrierServiceCode}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Destination</div>
                <div className="text-sm font-bold text-slate-900">{activeTrackingShipment.city}</div>
                <div className="text-[11px] font-mono text-slate-500">PIN: {activeTrackingShipment.pincode}</div>
              </div>
            </div>

            {/* Step-by-Step Checkpoint Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Transit Scan Log
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activeTrackingShipment.trackingHistory.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        step.status === 'COMPLETED'
                          ? 'border-emerald-600 text-emerald-600'
                          : step.status === 'CURRENT'
                          ? 'border-blue-600 bg-blue-600 animate-pulse'
                          : 'border-slate-300'
                      }`}
                    >
                      {step.status === 'COMPLETED' && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{step.location}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {step.date} • {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{step.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTrackingShipment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: 4x6" THERMAL SHIPPING LABEL PREVIEW & PRINT      */}
      {/* ========================================================= */}
      {activeLabelShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>4×6" Thermal Barcode Shipping Label</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveLabelShipment(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4x6 Printable Box Representation */}
            <div className="border-2 border-black p-4 rounded-xl bg-white font-mono text-[11px] space-y-3">
              {/* Carrier Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div>
                  <div className="text-base font-black uppercase tracking-wider">{activeLabelShipment.carrier}</div>
                  <div className="text-[10px]">AIR EXPRESS CARGO • PRIORITY</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold">{activeLabelShipment.city.toUpperCase()}</div>
                  <div className="text-[10px] font-bold">ROUTE: KA-BLR-01</div>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 border-b-2 border-black space-y-1">
                <div className="h-10 bg-slate-900 flex items-center justify-center text-white tracking-[0.3em] font-mono text-sm font-bold">
                  ||||| {activeLabelShipment.awb} |||||
                </div>
                <div className="text-xs font-black">AWB: {activeLabelShipment.awb}</div>
              </div>

              {/* Deliver To */}
              <div className="border-b-2 border-black pb-2 space-y-0.5">
                <div className="text-[9px] font-bold uppercase text-slate-500">SHIP TO / CONSIGNEE:</div>
                <div className="font-bold text-sm text-black">{activeLabelShipment.customerName}</div>
                <div className="text-[10px] text-slate-800 leading-snug">{activeLabelShipment.address}</div>
                <div className="font-bold text-xs">
                  {activeLabelShipment.city}, {activeLabelShipment.state} - {activeLabelShipment.pincode}
                </div>
                <div className="text-[10px] font-bold">PHONE: {activeLabelShipment.phone}</div>
              </div>

              {/* Shipped From */}
              <div className="border-b-2 border-black pb-2 text-[9px] text-slate-700 space-y-0.5">
                <div className="font-bold text-black uppercase">SHIPPED BY (CONSIGNOR):</div>
                <div>NEEL SAREE HOUSE (ESTD. 1978)</div>
                <div>Devaraja Market Building, Sayyaji Rao Road, Mysuru, KA - 570001</div>
                <div>GSTIN: 29AABCN8842P1Z4 • Silk Mark CSB: {activeLabelShipment.silkMarkAuditId}</div>
              </div>

              {/* Footer Weight & Fragile Warning */}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <div>
                  <span className="font-bold">WT: </span>
                  <span>{activeLabelShipment.totalWeightGrams}g</span>
                </div>
                <div className="font-black bg-black text-white px-2 py-0.5 rounded text-[9px] uppercase">
                  FRAGILE PURE SILK
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Label (4×6")</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SCHEDULE COURIER VAN PICKUP                     */}
      {/* ========================================================= */}
      {isSchedulePickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#7A1C30]" />
                <span>Schedule Courier Workshop Pickup</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSchedulePickupModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Dedicated Courier</label>
                <select
                  value={pickupCarrier}
                  onChange={(e) => setPickupCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800"
                >
                  <option value="Blue Dart Air Express">Blue Dart Air Express (Daily Scheduled Van)</option>
                  <option value="Delhivery Air">Delhivery Air Express</option>
                  <option value="DHL Express Global">DHL Express International</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup Time Window</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                >
                  <option value="AFTERNOON_02_04PM">Afternoon Slot (02:00 PM - 04:00 PM)</option>
                  <option value="EVENING_04_06PM">Evening Express Slot (04:30 PM - 06:30 PM)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Packed Handloom Parcels:</span>
                  <span className="font-bold text-slate-900">{stats.readyPickup} Boxes</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Location:</span>
                  <span className="font-bold text-slate-900">Mysuru Weave Studio</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSchedulePickupModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSchedulePickupModalOpen(false);
                  setPickupSuccessToast(true);
                  setTimeout(() => setPickupSuccessToast(false), 6000);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Pickup Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DAILY DISPATCH MANIFEST                          */}
      {/* ========================================================= */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7A1C30]">
                  Official Courier Handover Sheet
                </span>
                <h3 className="font-editorial text-xl font-bold text-slate-900">
                  Daily Dispatch Manifest (23 Aug 2026)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-300 rounded-xl p-4 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 text-[11px] font-mono">
                <div>
                  <div className="font-bold text-slate-900">NEEL SAREE HOUSE</div>
                  <div className="text-slate-500">Sayyaji Rao Road, Mysuru, KA</div>
                  <div className="text-slate-500">Contact: +91 821 244 8899</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">MANIFEST # MAN-20260823-01</div>
                  <div className="text-slate-500">Carrier: Blue Dart Air Express</div>
                  <div className="text-slate-500">Date: 23 Aug 2026, 04:30 PM</div>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono">
                    <th className="py-2">#</th>
                    <th className="py-2">AWB Number</th>
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Destination</th>
                    <th className="py-2 text-right">Declared Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {shipments.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="py-2">{idx + 1}</td>
                      <td className="py-2 font-bold text-slate-900">{s.awb}</td>
                      <td className="py-2 text-blue-600">{s.orderId}</td>
                      <td className="py-2">
                        {s.city} ({s.pincode})
                      </td>
                      <td className="py-2 text-right font-bold text-slate-900">
                        ₹{s.totalValueINR.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center font-mono text-[10px]">
                <div className="border-t border-dashed border-slate-400 pt-2">
                  <span>Neel Saree House Dispatch Manager Signature</span>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-2">
                  <span>Blue Dart Courier Driver Signature & Emp ID</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Manifest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
