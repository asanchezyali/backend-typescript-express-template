import { z } from 'zod';
import { ProductCategory } from '../entities/Product.js';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters long')
    .max(100, 'Product name must not exceed 100 characters')
    .nonempty('Product name is required'),
  description: z
    .string()
    .min(10, 'Product description must be at least 10 characters long')
    .max(500, 'Product description must not exceed 500 characters')
    .nonempty('Product description is required'),
  price: z
    .number()
    .min(0.01, 'Price must be at least 0.01')
    .max(10000, 'Price must not exceed 10000')
    .nonnegative('Price cannot be negative'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock must not exceed 10000')
    .optional()
    .default(0),
  category: z.nativeEnum(ProductCategory).optional().default(ProductCategory.ELECTRONICS),
  imageUrl: z.string().url('Invalid image URL format').max(255, 'Image URL must not exceed 255 characters').optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters long')
    .max(100, 'Product name must not exceed 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Product description must be at least 10 characters long')
    .max(500, 'Product description must not exceed 500 characters')
    .optional(),
  price: z.number().min(0.01, 'Price must be at least 0.01').max(10000, 'Price must not exceed 10000').optional(),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock must not exceed 10000')
    .optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  imageUrl: z.string().url('Invalid image URL format').max(255, 'Image URL must not exceed 255 characters').optional(),
  isActive: z.boolean().optional(),
});

export const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  search: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof createProductSchema>;
export type QueryParams = z.infer<typeof querySchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
