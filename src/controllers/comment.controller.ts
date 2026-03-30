import { type Request, type Response } from 'express'
import {
  CreateComment,
  UpdateComment,
  DeleteComment,
  GetComments,
  GetDetailComment
} from '../services/comment.service'
import { errorResponse, logError, successResponse } from '../utils/response'
import { UserToken } from '../types'
import { prisma } from '../lib/prisma'
import { CreateCommentSchema, UpdateCommentSchema } from '../validations/comment.validation'

export const GetAnnouncementComments = async (req: Request, res: Response) => {
  try {
    const announcementId = String(req.params.announcementId)
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)

    const { data, total } = await GetComments(announcementId, page, limit)

    return successResponse(res, "Announcement's Comments", data, 200, {
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
    const commentId = String(req.params.commentId)

    const data = await GetDetailComment(commentId)

    if (!data) {
      return errorResponse(res, 'Comment not found', 404)
    }

    return successResponse(res, 'Comment Detail', data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Create = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: UserToken }).user.id
    const requestData = req.body

    const validationData = CreateCommentSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation error', 400, validationData.error.flatten().fieldErrors)
    }

    const announcement = await prisma.announcement.findUnique({
      where: { 
        id: requestData.announcementId 
      }
    })

    if (!announcement) {
      return errorResponse(res, 'Announcement not found', 404)
    }

    const existingComment = await prisma.comment.findFirst({
      where: {
        userId,
        announcementId: requestData.announcementId
      }
    })

    if (existingComment) {
      return errorResponse(res, 'You have already commented on this announcement', 409)
    }

    const data = await CreateComment(userId, validationData.data)

    return successResponse(res, 'Comment created successfully', data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Update = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: UserToken }).user.id
    const commentId = String(req.params.commentId)
    const requestData = req.body

    const validationData = UpdateCommentSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation error', 400, validationData.error.flatten().fieldErrors)
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return errorResponse(res, 'Comment not found', 404)
    }

    if (comment.userId !== userId) {
      return errorResponse(res, 'You can only update your own comment', 403)
    }

    const data = await UpdateComment(commentId, validationData.data)

    return successResponse(res, 'Comment updated successfully', data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Delete = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: UserToken }).user.id
    const commentId = String(req.params.commentId)

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return errorResponse(res, 'Comment not found', 404)
    }

    if (comment.userId !== userId) {
      return errorResponse(res, 'You can only delete your own comment', 403)
    }

    const data = await DeleteComment(commentId)

    return successResponse(res, 'Comment deleted successfully', data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}