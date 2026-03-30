import { prisma } from '../lib/prisma'
import { CommentDto } from '../types'

export const GetComments = async (announcementId: string, page: number, limit: number) => {
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where: { announcementId },
      skip: offset,
      take: limit,
      orderBy: { 
        createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            photo: true,
            role: true,
          }
        }
      }
    }),
    prisma.comment.count({ where: { announcementId } })
  ])

  return { data, total }
}

export const GetDetailComment = async (id: string) => {
  return await prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          photo: true,
          role: true,
        }
      }
    }
  })
}

export const CreateComment = async (userId: string, payload: CommentDto) => {
  return await prisma.comment.create({
    data: {
      userId,
      announcementId: payload.announcementId,
      content: payload.content
    }
  })
}

export const UpdateComment = async (commentId: string, payload: Partial<CommentDto>) => {
  return await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: payload.content
    }
  })
}

export const DeleteComment = async (commentId: string) => {
  return await prisma.comment.delete({
    where: { id: commentId }
  })
}