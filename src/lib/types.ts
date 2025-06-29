// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription Types
export interface Prescription {
  id: string;
  customerId: string;
  doctorName: string;
  medications: Medication[];
  instructions: string;
  dateIssued: Date;
  expiryDate: Date;
  status: 'PENDING' | 'FILLED' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  frequency: string;
  price: number;
}

// Complaint Types
export interface Complaint {
  id: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'RESPONDED';
  createdAt: Date;
  updatedAt: Date;
}

// Role and Permission Types
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

// SEO Types
export interface SEOSetting {
  page: string;
  title: string;
  description: string;
  canonical?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalPrescriptions: number;
  totalComplaints: number;
  pendingPrescriptions: number;
  openComplaints: number;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}
