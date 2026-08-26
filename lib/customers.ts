export interface CustomerRecord {
  id: string;
  name: string;
  avatarBg: string;
  initials: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  totalOrders: number;
  totalSpend: number;
  lastActive: string;
  lastOrderDate?: string;
  preferredWeaves: string[];
}

export const SAMPLE_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-101',
    name: 'Dr. Ananya Rao',
    avatarBg: 'from-amber-400 to-amber-600',
    initials: 'AR',
    phone: '+91 98450 12345',
    email: 'ananya.rao@hospital.org',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    totalOrders: 4,
    totalSpend: 148500,
    lastActive: '2 hours ago',
    preferredWeaves: ['Mysore Silk', 'Kanchipuram Korvai'],
  },
  {
    id: 'cust-102',
    name: 'Smt. Radhika Reddy',
    avatarBg: 'from-rose-400 to-rose-600',
    initials: 'RR',
    phone: '+91 99890 98765',
    email: 'radhika.reddy@gmail.com',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    totalOrders: 6,
    totalSpend: 264000,
    lastActive: 'Yesterday, 03:40 PM',
    preferredWeaves: ['Kanchipuram 3-Shuttle', 'Tissue Georgette'],
  },
  {
    id: 'cust-103',
    name: 'Meera Deshmukh',
    avatarBg: 'from-purple-400 to-purple-600',
    initials: 'MD',
    phone: '+91 98200 44556',
    email: 'meera.deshmukh@outlook.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    totalOrders: 3,
    totalSpend: 88000,
    lastActive: '3 days ago',
    preferredWeaves: ['Paithani Asawali', 'Banarasi Katan'],
  },
  {
    id: 'cust-104',
    name: 'Pooja Singhania',
    avatarBg: 'from-blue-400 to-blue-600',
    initials: 'PS',
    phone: '+91 98110 33221',
    email: 'pooja.singhania@delhicorp.in',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    totalOrders: 2,
    totalSpend: 62000,
    lastActive: '4 days ago',
    preferredWeaves: ['Banarasi Kadwa', 'Chanderi Silk'],
  },
];
