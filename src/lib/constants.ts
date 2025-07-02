// App Constants
export const APP_NAME = 'Global Pharma Trading'
export const APP_DESCRIPTION = 'Your trusted pharmacy management system'
export const APP_VERSION = '1.0.0'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USERS: '/api/users',
  ADMIN: {
    USERS: '/api/admin/users',
    ROLES: '/api/admin/roles'
  },
  CUSTOMERS: '/api/customers',
  PRESCRIPTIONS: '/api/prescriptions',
  COMPLAINTS: '/api/complaints',
  CONTACT: '/api/contact',
  ROLES: '/api/roles',
  PERMISSIONS: '/api/permissions',
  STAFF: '/api/staff',
  SEO: '/api/seo',
  PAYMENT: '/api/create-payment-intent'
} as const

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  ADMIN: '/admin/dashboard',
  STAFF: '/staff-dashboard',
  SUPERVISOR: '/supervisor-dashboard',
  ASSISTANT: '/assistant-portal',
  CUSTOMER: '/dashboard'
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  SUPERVISOR: 'SUPERVISOR',
  ASSISTANT: 'ASSISTANT',
  CUSTOMER: 'CUSTOMER'
} as const

// Permissions
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Customer permissions
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  
  // Prescription permissions
  PRESCRIPTION_READ: 'prescription:read',
  PRESCRIPTION_WRITE: 'prescription:write',
  PRESCRIPTION_DELETE: 'prescription:delete',
  
  // Complaint permissions
  COMPLAINT_READ: 'complaint:read',
  COMPLAINT_WRITE: 'complaint:write',
  COMPLAINT_DELETE: 'complaint:delete',
  
  // System permissions
  ADMIN_ACCESS: 'admin:access',
  STAFF_ACCESS: 'staff:access',
  REPORTS_ACCESS: 'reports:access'
} as const

// Status Options
export const PRESCRIPTION_STATUS = {
  PENDING: 'PENDING',
  FILLED: 'FILLED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
} as const

export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
} as const

export const COMPLAINT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const

// Cookie Names
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'pharmacy_auth',
  THEME: 'pharmacy_theme',
  LANGUAGE: 'pharmacy_language'
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'pharmacy_user_preferences',
  CART: 'pharmacy_cart',
  RECENTLY_VIEWED: 'pharmacy_recently_viewed'
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  AVAILABLE_PAGE_SIZES: [5, 10, 20, 50, 100]
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm'
} as const

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
} as const

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#0ea5e9',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
} as const
