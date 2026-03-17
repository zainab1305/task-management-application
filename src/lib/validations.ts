import { z } from "zod";
import { TASK_STATUSES } from "@/models/Task";

const emailSchema = z.email().trim().toLowerCase();

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "Password must include upper, lower, and number",
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  status: z.enum(TASK_STATUSES).default("todo"),
});

export const taskUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    status: z.enum(TASK_STATUSES).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
  });

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(TASK_STATUSES).optional(),
  search: z.string().trim().max(120).optional(),
});
