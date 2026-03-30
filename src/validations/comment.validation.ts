import z from 'zod'

export const CreateCommentSchema = z.object({
  announcementId: z.string().min(1, 'Announcement Id is required'),
  content: z.string().min(1, 'Content is required').max(255, 'Content must be at most 255 characters')
})

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(255, 'Content must be at most 255 characters').optional(),
})
