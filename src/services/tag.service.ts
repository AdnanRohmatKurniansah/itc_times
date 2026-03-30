import { prisma } from '../lib/prisma'
import { TagDto } from '../types'

export const GetAllTag = async (page: number, limit: number) => {
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.tag.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.tag.count()
  ])

  return { data, total }
}

export const GetDetailTag = async (id: string) => {
  return await prisma.tag.findUnique({
    where: {
      id
    }
  })
}

export const GetUniqueTag = async (slug: string) => {
  return await prisma.tag.findUnique({
    where: {
      slug
    }
  })
}

export const CreateTag = async (payload: TagDto) => {
  return await prisma.tag.create({
    data: payload
  })
}

export const UpdateTag = async (id: string, payload: Partial<TagDto>) => {
  return await prisma.tag.update({
    where: {
      id
    },
    data: payload
  })
}

export const DeleteTag = async (id: string) => {
  return await prisma.tag.delete({
    where: {
      id
    }
  })
}
