/**
 * Authentication Validation Schemas
 * Zod schemas for runtime validation of auth-related data
 */

import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

/**
 * Inferred type from login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form validation schema
 * (To be used if registration is implemented)
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  confirmPassword: z.string(),
  role: z.enum(['ADMIN', 'MUNICIPALITY', 'NGO']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Inferred type from register schema
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Email validation schema (standalone)
 */
export const emailSchema = z.string().email('Email inválido');

/**
 * Password validation schema (standalone)
 */
export const passwordSchema = z
  .string()
  .min(6, 'Mínimo 6 caracteres')
  .max(100, 'Máximo 100 caracteres');
