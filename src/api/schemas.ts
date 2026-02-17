import { z } from 'zod'

/**
 * Handle "change" field which can be:
 * - null
 * - object: { value: number, pct: number, date: string }
 * We normalize to number | null (extracting the value)
 */
const changeSchema = z
  .union([
    z.null(),
    z.object({
      value: z.number(),
      pct: z.number(),
      date: z.string(),
    }),
  ])
  .transform((val) => {
    if (val === null) return null
    return val.value
  })
  .optional()
  .default(null)

/**
 * Handle "age" field which can be number or null
 */
const ageSchema = z
  .union([z.number(), z.null()])
  .transform((val) => val ?? 0)
  .optional()
  .default(0)

/**
 * Handle "gender" field which can be "m", "f", or other unknown values
 */
const genderSchema = z
  .union([z.enum(['m', 'f']), z.string(), z.null()])
  .transform((val) => {
    if (val === 'm' || val === 'f') return val
    return 'm' // Default to 'm' for unknown values
  })
  .optional()
  .default('m')

/**
 * Handle "flag" field which can have various values
 */
const flagSchema = z
  .union([z.enum(['up', 'down', 'unchanged', 'new']), z.string(), z.null()])
  .transform((val) => {
    if (
      val === 'up' ||
      val === 'down' ||
      val === 'unchanged' ||
      val === 'new'
    ) {
      return val
    }
    return 'unchanged' // Default for unknown values
  })
  .optional()
  .default('unchanged')

/**
 * Handle "citizenship" field which can be string or null
 */
const citizenshipSchema = z
  .union([z.string(), z.null()])
  .transform((val) => val ?? 'unknown')
  .optional()
  .default('unknown')

export const BillionaireListEntrySchema = z.object({
  rank: z.number(),
  uri: z.string(),
  name: z.string(),
  gender: genderSchema,
  age: ageSchema,
  networth: z.number(),
  change: changeSchema,
  diff: z.number().optional().default(0),
  flag: flagSchema,
  citizenship: citizenshipSchema,
  industry: z.array(z.string()).optional().default([]),
  source: z.array(z.string()).optional().default([]),
})

export const BillionaireListSchema = z.array(BillionaireListEntrySchema)

// Wrapper schema for the list endpoint response
export const BillionaireListResponseSchema = z.object({
  date: z.string(),
  count: z.number(),
  woman: z.number().optional(),
  total: z.number(),
  list: BillionaireListSchema,
})

// ===== Top 10 Historical Schema =====

const Top10EntrySchema = z.object({
  rank: z.number(),
  uri: z.string(),
  name: z.string(),
  networth: z.number(),
  industry: z.array(z.string()).optional().default([]),
})

export const Top10SnapshotSchema = z.record(
  z.string(),
  z.array(Top10EntrySchema),
)

// ===== Profile Schema =====

export const BillionaireProfileSchema = z.object({
  uri: z.string(),
  name: z.string(),
  birthDate: z.string().optional().default(''),
  gender: z.enum(['m', 'f']).optional().default('m'),
  citizenship: z.string().optional().default(''),
  residence: z
    .object({
      country: z.string().optional().default(''),
      state: z.string().optional().default(''),
      city: z.string().optional().default(''),
    })
    .optional()
    .default({ country: '', state: '', city: '' }),
  industry: z.array(z.string()).optional().default([]),
  source: z.array(z.string()).optional().default([]),
  image: z.string().optional().default(''),
  children: z.number().optional().default(0),
  maritalStatus: z.string().optional().default(''),
  education: z
    .array(z.object({ school: z.string(), degree: z.string() }))
    .optional()
    .default([]),
  organization: z
    .object({ name: z.string(), title: z.string() })
    .optional()
    .default({ name: '', title: '' }),
  selfMade: z
    .object({
      _is: z.boolean(),
      type: z.string(),
      rank: z.number(),
    })
    .optional()
    .default({ _is: false, type: '', rank: 0 }),
})
