import z from 'zod'

export const AnnouncementCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  tags: z
    .union([
      z.array(z.string().min(1)),
      z.string().transform((val) => {
        try {
          const parsed = JSON.parse(val)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })
    ])
    .optional()
    .default([])
})

export const AnnouncementUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  tags: z
    .union([
      z.array(z.string().min(1)),
      z.string().transform((val) => {
        try {
          const parsed = JSON.parse(val)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })
    ])
    .optional()
})