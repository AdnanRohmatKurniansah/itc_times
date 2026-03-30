export interface UserToken {
  id: string
  fullname: string
  email: string
  photo: string | null
  role: string
  tokenVersion: number
}

export type UserDto = {
  fullname: string
  email: string
  role: 'user' | 'kadiv' | 'admin'
  photo?: string | null
  password: string
}

export type TagDto = {
  name: string
  slug: string
}

export type AnnouncementDto = {
  title: string
  slug: string
  content: string
  imageUrl?: string | null
  authorId: string
  tags?: string[]
}

export type CommentDto = {
  announcementId: string
  content: string
}