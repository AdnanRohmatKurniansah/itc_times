import { prisma } from '../lib/prisma'
import { AnnouncementDto } from '../types'
import { slugify } from '../utils/help-func'

export type AnnouncementFilter = {
  page: number
  limit: number
  tags?: string[]      
  period?: 'week' | 'month' | 'year' | 'all'
  search?: string    
}

const formatAnnouncement = (announcement: any) => {
  const { announcementTags, ...rest } = announcement

  return {
    ...rest,
    tags: announcementTags.map((item: any) => item.tag)
  }
}

export const GetAllAnnouncement = async (filter: AnnouncementFilter) => {
  const { page, limit, tags, period, search } = filter
  const offset = (page - 1) * limit

  const where: any = {}

  if (period && period !== 'all') {
    const now = new Date()
    const from = new Date()

    if (period === 'week') from.setDate(now.getDate() - 7)
    else if (period === 'month') from.setMonth(now.getMonth() - 1)
    else if (period === 'year') from.setFullYear(now.getFullYear() - 1)

    where.createdAt = { gte: from }
  }

  if (tags && tags.length > 0) {
    where.announcementTags = {
      some: {
        tag: {
          slug: { in: tags }
        }
      }
    }
  }

  if (search) {
    const searchTerm = search.trim()
    where.OR = [
      { 
        title: { 
          contains: searchTerm, 
          mode: 'insensitive' 
        } 
      },
      { 
        content: { 
          contains: searchTerm, 
          mode: 'insensitive' 
        } 
      },
      {
        announcementTags: {
          some: {
            tag: {
              name: { contains: searchTerm, mode: 'insensitive' }
            }
          }
        }
      }
    ]
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { 
        createdAt: 'desc' 
      },
      include: {
        author: { 
          select: { 
            id: true, 
            fullname: true, 
            photo: true 
          } 
        },
        announcementTags: { 
          include: { 
            tag: true 
          } 
        }
      }
    }),
    prisma.announcement.count({ where })
  ])

  const formatted = data.map(formatAnnouncement)

  return { data: formatted, total }
}

export const GetDetailAnnouncement = async (id: string) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          fullname: true,
          photo: true
        }
      },
      announcementTags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!announcement) return null

  return formatAnnouncement(announcement)
}

export const GetUniqueAnnouncement = async (slug: string) => {
  const announcement = await prisma.announcement.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          fullname: true,
          photo: true
        }
      },
      announcementTags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!announcement) return null

  return formatAnnouncement(announcement)
}

const findOrCreateTags = async (tagNames: string[]) => {
  const tags = await Promise.all(
    tagNames.map(async (name) => {
      const slug = slugify(name)

      return prisma.tag.upsert({
        where: { slug },
        update: {},              
        create: { slug, name }   
      })
    })
  )

  return tags
}

export const CreateAnnouncement = async (payload: AnnouncementDto) => {
  const { tags = [], ...announcementData } = payload

  const resolvedTags = tags.length > 0 ? await findOrCreateTags(tags) : []

  const announcement = await prisma.announcement.create({
    data: {
      ...announcementData,
      announcementTags: {
        create: resolvedTags.map((tag) => ({ tagId: tag.id }))
      }
    },
    include: {
      author: {
        select: {
          id: true,
          fullname: true,
          photo: true
        }
      },
      announcementTags: {
        include: {
          tag: true
        }
      }
    }
  })

  return formatAnnouncement(announcement)
}

export const UpdateAnnouncement = async (id: string, payload: Partial<Omit<AnnouncementDto, 'authorId'>>) => {
  const { tags, ...announcementData } = payload

  if (tags !== undefined) {
    const resolvedTags = tags.length > 0 ? await findOrCreateTags(tags) : []

    await prisma.announcementTag.deleteMany({ 
      where: { 
        announcementId: id 
      } 
    })

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...announcementData,
        announcementTags: {
          create: resolvedTags.map((tag) => ({ tagId: tag.id }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            fullname: true,
            photo: true
          }
        },
        announcementTags: {
          include: {
            tag: true
          }
        }
      }
    })

    return formatAnnouncement(announcement)
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: announcementData,
    include: {
      author: {
        select: {
          id: true,
          fullname: true,
          photo: true
        }
      },
      announcementTags: {
        include: {
          tag: true
        }
      }
    }
  })

  return formatAnnouncement(announcement)
}

export const DeleteAnnouncement = async (id: string) => {
  return prisma.announcement.delete({ 
    where: { 
      id 
    } 
  })
}