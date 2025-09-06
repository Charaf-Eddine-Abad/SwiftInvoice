import { z } from 'zod'

// User registration validation
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>

// User login validation
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type UserLoginInput = z.infer<typeof userLoginSchema>

// Client creation/update validation
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>

// Invoice item validation
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
})

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>

// Invoice creation/update validation
/* export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
}) */

  // Add this custom interface to fix the type mismatch
export interface InvoiceFormInput {
  clientId: string;
  issueDate: string;
  dueDate: string;
  tax?: number;
  discount?: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

  // Invoice creation/update validation
export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  tax: z.number().min(0, 'Tax cannot be negative').optional().default(0), // Add .optional()
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0), // Add .optional()
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

// Invoice status update validation
export const invoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']),
})

export type InvoiceStatusInput = z.infer<typeof invoiceStatusSchema>

// Email verification validation
export const emailVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>

// Password reset request validation
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>

// Password reset validation
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type PasswordResetInput = z.infer<typeof passwordResetSchema>

// Phase 2 Validation Schemas

// Recurring Invoice Line Item validation
export const recurringLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
})

export type RecurringLineItemInput = z.infer<typeof recurringLineItemSchema>

// Recurring Invoice validation
export const recurringInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY']),
  interval: z.number().int().positive('Interval must be a positive integer').default(1),
  startDate: z.string().min(1, 'Start date is required'),
  tax: z.number().min(0, 'Tax cannot be negative').optional().default(0),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  lineItems: z.array(recurringLineItemSchema).min(1, 'At least one line item is required'),
})

export type RecurringInvoiceInput = z.infer<typeof recurringInvoiceSchema>

// Reminder Policy validation
export const reminderPolicySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  reminderDays: z.array(z.number().int().min(0, 'Reminder days must be non-negative')).min(1, 'At least one reminder day is required'),
  isActive: z.boolean().default(true),
})

export type ReminderPolicyInput = z.infer<typeof reminderPolicySchema>

// Expense validation
export const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  category: z.enum([
    'OFFICE_SUPPLIES',
    'TRAVEL',
    'MEALS',
    'SOFTWARE',
    'MARKETING',
    'PROFESSIONAL_SERVICES',
    'UTILITIES',
    'RENT',
    'EQUIPMENT',
    'OTHER'
  ]),
  vendor: z.string().min(1, 'Vendor is required'),
  description: z.string().min(1, 'Description is required'),
  receiptUrl: z.string().refine(
    (val) => !val || val.startsWith('http') || val.startsWith('/uploads/'),
    'Receipt URL must be a valid URL or file path'
  ).optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

// Expense filter validation
export const expenseFilterSchema = z.object({
  category: z.string().optional(),
  vendor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
})

export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>

