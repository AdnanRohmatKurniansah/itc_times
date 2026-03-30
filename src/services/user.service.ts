import { prisma } from '../lib/prisma'
import { UserDto } from '../types'

export const GetUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id
    },
    omit: {
      password: true
    }
  })
}

export const GetUserWithPassword = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}

export const GetUniqueUser = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email
    }
  })
}

export const CreateUser = async (payload: UserDto) => {
  return await prisma.user.create({
    data: payload,
    omit: {
      password: true
    }
  })
}

export const CreateUserWithPassword = async (payload: UserDto) => {
  return await prisma.user.create({
    data: payload
  })
}

export const UpdateUser = async (id: string, payload: Partial<UserDto>) => {
  return await prisma.user.update({
    where: {
      id
    },
    data: payload,
    omit: {
      password: true
    }
  })
}

export const GetUserByFilter = async (keyword: string, role: string, page: number, sortBy: string, limit: number) => {  
  const VALID_ROLES = ['user', 'kadiv', 'admin']
    
  if (role && !VALID_ROLES.includes(role.toLowerCase())) {
    throw new Error(`Invalid role: ${role}`)
  }
  const offset = (page - 1) * limit

  const where: any = {}

  if (keyword) {
    where.OR = [
      {
        fullname: {
          contains: keyword,
          mode: 'insensitive'
        }
      }
    ]
  }

  if (role) {
    where.role = role 
  }

  let orderBy: any[] = []

  switch (sortBy) {
    case 'name_asc':
      orderBy = [{ fullname: 'asc' }]
      break

    case 'name_desc':
      orderBy = [{ fullname: 'desc' }]
      break

    case 'oldest':
      orderBy = [{ createdAt: 'asc' }]
      break

    case 'newest':
    default:
      orderBy = [{ createdAt: 'desc' }]
      break
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      omit: {
        password: true
      }
    }),
    prisma.user.count({ where })
  ])

  return { data, total }
}

export const UpdateUserRole = async (id: string, role: 'user' | 'kadiv' | 'admin') => {
  return await prisma.user.update({
    where: {
      id
    },
    data: {
      role
    },
    omit: {
      password: true
    }
  })
}
