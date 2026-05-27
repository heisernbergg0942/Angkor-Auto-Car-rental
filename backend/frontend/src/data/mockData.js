export const rentalTrends = [
  { day: 'Mon', online: 280, walkIn: 100 },
  { day: 'Tue', online: 310, walkIn: 90 },
  { day: 'Wed', online: 260, walkIn: 80 },
  { day: 'Thu', online: 420, walkIn: 140 },
  { day: 'Fri', online: 510, walkIn: 160 },
  { day: 'Sat', online: 620, walkIn: 200 },
  { day: 'Sun', online: 680, walkIn: 220 },
];

export const recentActivity = [
  {
    id: 1,
    type: 'return',
    title: 'Vehicle Return',
    description: 'Toyota Camry (Plate: FS-442) returned by David Chen.',
    time: '12 MINS AGO',
    icon: 'check',
    color: 'emerald',
  },
  {
    id: 2,
    type: 'reservation',
    title: 'New Reservation',
    description: 'Audi A4 booked for 5 days by Sarah Miller starting tomorrow.',
    time: '45 MINS AGO',
    icon: 'calendar',
    color: 'blue',
  },
  {
    id: 3,
    type: 'customer',
    title: 'New Customer Profile',
    description: 'Corporate account registered for "Blue Horizon Tech".',
    time: '2 HOURS AGO',
    icon: 'user',
    color: 'slate',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Service Alert',
    description: 'Tesla Model 3 reported low tire pressure during return.',
    time: '3 HOURS AGO',
    icon: 'warning',
    color: 'amber',
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Received',
    description: 'Invoice #8821 paid by Enterprise Corp. Amount: $2,340.',
    time: '5 HOURS AGO',
    icon: 'dollar',
    color: 'emerald',
  },
];

export const actionRequired = [
  {
    id: 'VH-9384',
    vehicle: 'Toyota Camry 2023',
    vin: '...9384',
    issue: 'Maintenance Overdue',
    severity: 'High',
  },
  {
    id: 'VH-2214',
    vehicle: 'Ford Transit Van',
    vin: '...2214',
    issue: 'Pending Approval',
    severity: 'Medium',
  },
  {
    id: 'VH-8821',
    vehicle: 'Tesla Model 3',
    vin: '...8821',
    issue: 'Return Inspection',
    severity: 'Normal',
  },
  {
    id: 'VH-4412',
    vehicle: 'BMW X5 2022',
    vin: '...4412',
    issue: 'Insurance Renewal',
    severity: 'Medium',
  },
];

export const fleetAvailability = [
  {
    id: 'FS-209',
    model: 'Tesla Model Y',
    type: 'SUV',
    color: 'White',
    status: 'Available',
    lastMaintenance: 'Oct 12, 2023',
    availability: 100,
    image: '/tesla_model_s.png',
  },
  {
    id: 'FS-881',
    model: 'BMW X5',
    type: 'Luxury SUV',
    color: 'Black',
    status: 'Rented',
    lastMaintenance: 'Nov 05, 2023',
    availability: 10,
    image: '/bmw_x5.png',
  },
  {
    id: 'FS-782',
    model: 'Tesla Model 3',
    type: 'Sedan',
    color: 'Blue',
    status: 'Maintenance',
    lastMaintenance: 'Overdue',
    availability: 0,
    image: '/tesla_model_s.png',
  },
  {
    id: 'FS-334',
    model: 'Audi A6',
    type: 'Executive',
    color: 'Silver',
    status: 'Available',
    lastMaintenance: 'Dec 01, 2023',
    availability: 85,
    image: '/audi_a6.png',
  },
  {
    id: 'FS-551',
    model: 'Mercedes E-Class',
    type: 'Luxury',
    color: 'Navy',
    status: 'Rented',
    lastMaintenance: 'Nov 28, 2023',
    availability: 35,
    image: '/mercedes_eclass.png',
  },
  {
    id: 'FS-102',
    model: 'Volvo S90',
    type: 'Sedan',
    color: 'White',
    status: 'Available',
    lastMaintenance: 'Dec 10, 2023',
    availability: 90,
    image: '/volvo_s90.png',
  },
];

export const customers = [
  { id: 'C-001', name: 'David Chen', email: 'david.chen@email.com', phone: '+1 415-555-0142', rentals: 12, status: 'Active', joined: 'Jan 2023', tier: 'Gold' },
  { id: 'C-002', name: 'Sarah Miller', email: 'sarah.miller@email.com', phone: '+1 212-555-0198', rentals: 5, status: 'Active', joined: 'Mar 2023', tier: 'Silver' },
  { id: 'C-003', name: 'Blue Horizon Tech', email: 'fleet@bluehorizon.com', phone: '+1 312-555-0167', rentals: 48, status: 'Active', joined: 'Oct 2022', tier: 'Corporate' },
  { id: 'C-004', name: 'James Wilson', email: 'j.wilson@email.com', phone: '+1 303-555-0211', rentals: 3, status: 'Active', joined: 'Aug 2023', tier: 'Standard' },
  { id: 'C-005', name: 'Emma Thompson', email: 'e.thompson@email.com', phone: '+1 206-555-0189', rentals: 8, status: 'Inactive', joined: 'May 2023', tier: 'Silver' },
  { id: 'C-006', name: 'Acme Corp', email: 'fleet@acmecorp.com', phone: '+1 404-555-0123', rentals: 92, status: 'Active', joined: 'Feb 2022', tier: 'Corporate' },
];

export const activeRentals = [
  { id: 'R-49281', customer: 'David Chen', vehicle: 'BMW X5', plate: 'FS-881', start: 'Dec 14, 2023', end: 'Dec 18, 2023', amount: '$580', status: 'Active' },
  { id: 'R-49276', customer: 'Blue Horizon Tech', vehicle: 'Tesla Model Y', plate: 'FS-209', start: 'Dec 12, 2023', end: 'Dec 20, 2023', amount: '$1,080', status: 'Active' },
  { id: 'R-49258', customer: 'Sarah Miller', vehicle: 'Audi A6', plate: 'FS-334', start: 'Dec 10, 2023', end: 'Dec 15, 2023', amount: '$575', status: 'Extension Requested' },
  { id: 'R-49230', customer: 'James Wilson', vehicle: 'Volvo S90', plate: 'FS-102', start: 'Dec 8, 2023', end: 'Dec 14, 2023', amount: '$750', status: 'Overdue' },
  { id: 'R-49215', customer: 'Emma Thompson', vehicle: 'Mercedes E-Class', plate: 'FS-551', start: 'Dec 5, 2023', end: 'Dec 12, 2023', amount: '$1,155', status: 'Completed' },
];

export const revenueData = [
  { month: 'Jul', revenue: 38200, target: 35000 },
  { month: 'Aug', revenue: 42100, target: 40000 },
  { month: 'Sep', revenue: 39800, target: 42000 },
  { month: 'Oct', revenue: 51300, target: 45000 },
  { month: 'Nov', revenue: 64200, target: 55000 },
  { month: 'Dec', revenue: 84250, target: 70000 },
];
