import { z } from 'zod'

export const TagCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150)
})

export const TagUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150).optional()
})