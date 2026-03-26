import { z } from 'zod';
import {
  insertContactMessageSchema,
  insertOrderSchema,
  insertUserSchema,
  type InsertOrder,
} from './schema';

const insertCarSchema = z.object({}).passthrough();
const insertMessageSchema = insertContactMessageSchema;

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        400: z.object({ message: z.string() }),
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        401: z.null(),
      },
    },
  },
  cars: {
    list: {
      method: 'GET' as const,
      path: '/api/cars',
      input: z.object({
        search: z.string().optional(),
        brandId: z.coerce.number().optional(),
        categoryId: z.coerce.number().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        year: z.coerce.number().optional(),
        condition: z.enum(['new', 'used']).optional(),
        isFeatured: z.coerce.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // Full car object with relations
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cars/:id',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cars',
      input: insertCarSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cars/:id',
      input: insertCarSchema.partial(),
      responses: {
        200: z.any(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cars/:id',
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  brands: {
    list: {
      method: 'GET' as const,
      path: '/api/brands',
      responses: {
        200: z.array(z.object({ id: z.number(), name: z.string() })),
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.object({ id: z.number(), name: z.string() })),
      },
    },
  },
  cart: {
    get: {
      method: 'GET' as const,
      path: '/api/cart',
      responses: {
        200: z.any(), // Cart with items and car details
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/cart/items',
      input: z.object({ carId: z.number(), quantity: z.number().default(1) }),
      responses: {
        200: z.any(),
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/cart/items/:id',
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.any(),
      },
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/cart/items/:id',
      responses: {
        200: z.any(),
      },
    },
    clear: {
      method: 'POST' as const,
      path: '/api/cart/clear',
      responses: {
        200: z.void(),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.any()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status',
      input: z.object({ status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]) }),
      responses: {
        200: z.any(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertMessageSchema,
      responses: {
        201: z.any(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/contact', // Admin only
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalOrders: z.number(),
          totalSales: z.number(),
          totalCars: z.number(),
          totalUsers: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type { InsertOrder };
