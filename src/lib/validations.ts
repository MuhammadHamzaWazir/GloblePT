import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// User Schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
})

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']).optional(),
  isActive: z.boolean().optional()
})

// Customer Schemas
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().max(100, 'Emergency contact must be less than 100 characters').optional(),
  medicalHistory: z.string().max(1000, 'Medical history must be less than 1000 characters').optional(),
  allergies: z.string().max(500, 'Allergies must be less than 500 characters').optional()
})

export const updateCustomerSchema = createCustomerSchema.partial()

// Prescription Schemas
export const createPrescriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  doctorName: z.string().min(2, 'Doctor name must be at least 2 characters').max(100, 'Doctor name must be less than 100 characters'),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    frequency: z.string().min(1, 'Frequency is required'),
    price: z.number().min(0, 'Price must be positive')
  })).min(1, 'At least one medication is required'),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters'),
  dateIssued: z.string(),
  expiryDate: z.string(),
  status: z.enum(['PENDING', 'FILLED', 'EXPIRED', 'CANCELLED']).default('PENDING')
})

export const updatePrescriptionSchema = createPrescriptionSchema.partial().extend({
  id: z.string().min(1, 'Prescription ID is required')
})

// Complaint Schemas
export const createComplaintSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
})

export const updateComplaintSchema = z.object({
  id: z.string().min(1, 'Complaint ID is required'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().max(2000, 'Resolution must be less than 2000 characters').optional()
})

// Contact Schemas
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters')
})

// Role Schemas
export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(50, 'Role name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  permissions: z.array(z.string()).default([])
})

export const updateRoleSchema = createRoleSchema.partial().extend({
  id: z.string().min(1, 'Role ID is required')
})

// SEO Schemas
export const seoSchema = z.object({
  page: z.string().min(1, 'Page is required'),
  title: z.string().min(1, 'Title is required').max(60, 'Title must be less than 60 characters'),
  description: z.string().min(1, 'Description is required').max(160, 'Description must be less than 160 characters'),
  canonical: z.string().url('Invalid URL format').optional()
})

// Payment Schemas
export const paymentIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('usd'),
  prescriptionId: z.string().optional(),
  customerId: z.string().optional()
})

// Query Schemas
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type SEOInput = z.infer<typeof seoSchema>
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
