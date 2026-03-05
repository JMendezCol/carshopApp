import { z } from 'zod';
import { insertVehicleSchema, vehicles, insertPolicySchema, companyPolicies, insertMessageSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  vehicles: {
    list: {
      method: 'GET' as const,
      path: '/api/vehicles' as const,
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/vehicles/:id' as const,
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles' as const,
      input: insertVehicleSchema,
      responses: {
        201: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/vehicles/:id' as const,
      input: insertVehicleSchema.partial().extend({ status: z.string().optional() }),
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/vehicles/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  policies: {
    list: {
      method: 'GET' as const,
      path: '/api/policies' as const,
      responses: {
        200: z.array(z.custom<typeof companyPolicies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/policies/:id' as const,
      responses: {
        200: z.custom<typeof companyPolicies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/policies' as const,
      input: insertPolicySchema,
      responses: {
        201: z.custom<typeof companyPolicies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/policies/:id' as const,
      input: insertPolicySchema.partial(),
      responses: {
        200: z.custom<typeof companyPolicies.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/policies/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  support: {
    sendMessage: {
      method: 'POST' as const,
      path: '/api/support/message' as const,
      input: insertMessageSchema,
      responses: {
        201: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
    chatbot: {
      method: 'POST' as const,
      path: '/api/support/chat' as const,
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({ reply: z.string() }),
      },
    }
  }
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
