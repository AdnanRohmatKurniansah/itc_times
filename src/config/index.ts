import { config } from 'dotenv'

config()

export const BASE_URL = process.env.BASE_URL
export const NODE_ENV = process.env.NODE_ENV
export const DATABASE_URL = process.env.DATABASE_URL
export const PORT = process.env.PORT
export const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN
export const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS
