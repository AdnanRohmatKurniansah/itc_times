import { type Request, type Response } from 'express'
import { deleteFromCloudinary, uploadToCloudinary } from '../lib/cloudinary'
import { slugify } from '../utils/help-func'
import { errorResponse, logError, successResponse } from '../utils/response'
import {
  CreateAnnouncement,
  DeleteAnnouncement,
  GetAllAnnouncement,
  GetDetailAnnouncement,
  GetUniqueAnnouncement,
  UpdateAnnouncement
} from '../services/announcement.service'
import {
  AnnouncementCreateSchema,
  AnnouncementUpdateSchema
} from '../validations/announcement.validation'
import { UserToken } from '../types'

export const GetAll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)

    const rawTags = req.query.tags

    let tags: string[] = []

    if (rawTags) {
      if (Array.isArray(rawTags)) {
        tags = rawTags.map(String)
      } else {
        tags = String(rawTags).split(',').map((t) => t.trim()).filter(Boolean)
      }
    }

    const period = String(req.query.period || 'all') as 'week' | 'month' | 'year' | 'all'
    const validPeriods = ['week', 'month', 'year', 'all']

    if (!validPeriods.includes(period)) {
      return errorResponse(res, 'Invalid period. Use: week, month, year, or all', 400)
    }

    const search = req.query.search ? String(req.query.search) : undefined

    const { data, total } = await GetAllAnnouncement({ page, limit, tags, period, search })

    return successResponse(res, "Announcement's Data", data, 200, { 
      total, 
      page, 
      limit
    })
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetById = async (req: Request, res: Response) => {
  try {
    const announcementId = String(req.params.announcementId)

    const data = await GetDetailAnnouncement(announcementId)

    if (!data) {
        return errorResponse(res, 'Announcement not found', 404)
    }

    return successResponse(res, "Announcement's Detail Data", data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug)

    const data = await GetUniqueAnnouncement(slug)

    if (!data) {
        return errorResponse(res, 'Announcement not found', 404)
    }

    return successResponse(res, "Announcement's Detail Data", data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Create = async (req: Request, res: Response) => {
  try {
    const requestData = await req.body
    const imageFile = req.file
    const authorId = (req as Request & { user: UserToken }).user.id

    const validationData = AnnouncementCreateSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    if (!authorId) {
        return errorResponse(res, 'Unauthorized', 401)
    }
    const slug = slugify(validationData.data.title)

    const existAnnouncement = await GetUniqueAnnouncement(slug)

    if (existAnnouncement) {
      return errorResponse(res, 'Announcement with this title already exists', 409)
    }

    let imageUrl: string | null = null

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile, 'announcements')
    }

    const announcement = await CreateAnnouncement({
      title: validationData.data.title,
      slug,
      content: validationData.data.content,
      imageUrl,
      authorId,
      tags: validationData.data.tags
    })

    return successResponse(res, 'Announcement created successfully', announcement)
  } catch (error: any) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode)
    }
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Update = async (req: Request, res: Response) => {
  try {
    const announcementId = String(req.params.announcementId)
    const requestData = await req.body
    const imageFile = req.file

    const existAnnouncement = await GetDetailAnnouncement(announcementId)

    if (!existAnnouncement) {
      return errorResponse(res, 'Announcement not found', 404)
    }

    const validationData = AnnouncementUpdateSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    let imageUrl = existAnnouncement.imageUrl
    if (imageFile) {
      await deleteFromCloudinary(existAnnouncement.imageUrl)
      imageUrl = await uploadToCloudinary(imageFile, 'announcements')
    }

    let slug = existAnnouncement.slug

    if (validationData.data.title && validationData.data.title !== existAnnouncement.title) {
      slug = slugify(validationData.data.title)
      const slugExist = await GetUniqueAnnouncement(slug)

      if (slugExist && slugExist.id !== announcementId) {
        return errorResponse(res, 'Announcement with this title already exists', 409)
      }
    }

    const updated = await UpdateAnnouncement(announcementId, {
      title: validationData.data.title,
      slug,
      content: validationData.data.content,
      imageUrl,
      tags: validationData.data.tags
    })

    return successResponse(res, 'Announcement updated successfully', updated)
  } catch (error: any) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode)
    }
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Delete = async (req: Request, res: Response) => {
  try {
    const announcementId = String(req.params.announcementId)

    const existAnnouncement = await GetDetailAnnouncement(announcementId)

    if (!existAnnouncement) {
      return errorResponse(res, 'Announcement not found', 404)
    }

    await deleteFromCloudinary(existAnnouncement.imageUrl)

    const response = await DeleteAnnouncement(announcementId)
    
    return successResponse(res, 'Announcement deleted successfully', response)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}