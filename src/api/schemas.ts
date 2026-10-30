import { z } from 'zod'

/** The fields used by the product. RTB values arrive in millions of USD. */
const BillionaireListEntrySchema = z.object({
  rank: z.number().int().positive(),
  uri: z.string().min(1),
  name: z.string().min(1),
  networth: z.number().nonnegative(),
  source: z.array(z.string()).optional(),
  industry: z.array(z.string()).optional().default([]),
})
export const BillionaireListResponseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  list: z.array(BillionaireListEntrySchema),
})
