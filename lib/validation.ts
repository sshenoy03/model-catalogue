import { z } from "zod";

export const modelSchema = z.object({
  model_id: z.string().min(1),
  model_name: z.string().min(1),
  developer: z.string().min(1),

  description: z.string().optional(),
  parameters: z.string().optional(),

  context_length: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  license: z.string().optional(),
  modality: z.string().optional(),
  model_type: z.string().optional(),

  huggingface_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  github_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  documentation_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
});

export const benchmarkSchema = z.object({
  model_id: z.string().min(1),
  benchmark: z.string().min(1),
  score: z.coerce.number(),
});

export const catalogueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});