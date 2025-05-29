import { z } from 'zod';
import { UserRole } from '../entities/User.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must not exceed 50 characters')
    .nonempty('First name is required'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must not exceed 50 characters')
    .nonempty('Last name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .max(100, 'Password must not exceed 100 characters')
    .nonempty('Password is required'),
  confirmedPassword: z.string().nonempty('Confirm password is required'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
  password: z.string().nonempty('Password is required'),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must not exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty('Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .max(100, 'New password must not exceed 100 characters')
    .nonempty('New password is required'),
  confirmNewPassword: z.string().nonempty('Confirm new password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().nonempty('Token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .max(100, 'New password must not exceed 100 characters')
    .nonempty('New password is required'),
  confirmNewPassword: z.string().nonempty('Confirm new password is required'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
