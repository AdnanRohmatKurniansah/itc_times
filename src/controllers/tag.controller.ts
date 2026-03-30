import { type Request, type Response } from 'express'
import { errorResponse, logError, successResponse } from '../utils/response'
import { TagCreateSchema, TagUpdateSchema } from '../validations/tag.validation'
import { GetAllTag, GetDetailTag, CreateTag, UpdateTag, DeleteTag, GetUniqueTag } from '../services/tag.service'
import { slugify } from '../utils/help-func'

export const GetAll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)

    const { data, total } = await GetAllTag(page, limit)

    return successResponse(res, "Tag's Data", data, 200, {
      total,
      page,
      limit
    })
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Create = async (req: Request, res: Response) => {
  try {
    const requestData = await req.body

    const validationData = TagCreateSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    const slug = slugify(validationData.data.name)

    const existTag = await GetUniqueTag(slug)

    if (existTag) {
      return errorResponse(res, 'Tag already exist', 409)
    }

    const data = await CreateTag({
      ...validationData.data,
      slug,
    })

    return successResponse(res, 'New Tag has been added', data)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetById = async (req: Request, res: Response) => {
  try {
    const tagId = String(req.params.tagId)

    const tag = await GetDetailTag(tagId)

    if (!tag) {
      return errorResponse(res, 'Tag not found', 404)
    }

    return successResponse(res, 'Tag detail data', tag)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug)

    const tag = await GetUniqueTag(slug)

    if (!tag) { 
      return errorResponse(res, 'Tag not found', 404)
    }

    return successResponse(res, 'Tag detail data', tag)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Update = async (req: Request, res: Response) => {
  try {
    const tagId = String(req.params.tagId)
    const requestData = await req.body

    const existTag = await GetDetailTag(tagId)
    if (!existTag) {
      return errorResponse(res, 'Tag not found', 404)
    }

    const validationData = TagUpdateSchema.safeParse(requestData)
    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    let slug = existTag.slug

    if (validationData.data.name && validationData.data.name !== existTag.name) {
      slug = slugify(validationData.data.name)

      const slugExist = await GetUniqueTag(slug)
      if (slugExist && slugExist.id !== tagId) {
        return errorResponse(res, 'Tag already exist', 409)
      }
    }

    const updatedTag = await UpdateTag(tagId, {
      ...validationData.data,
      slug
    })

    return successResponse(res, 'Tag has been updated', updatedTag)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Delete = async (req: Request, res: Response) => {
  try {
    const tagId = String(req.params.tagId)

    const existTag = await GetDetailTag(tagId)

    if (!existTag) {
      return errorResponse(res, 'Tag not found', 404)
    }

    const response = await DeleteTag(tagId)

    return successResponse(res, 'Tag has been deleted', response)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}