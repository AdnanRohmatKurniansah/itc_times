import jwt from 'jsonwebtoken'
import { JWT_ACCESS_TOKEN } from '../config'
import { UserToken } from '../types'

export const UserAccessToken = (payload: UserToken): string => {
  return jwt.sign(payload, JWT_ACCESS_TOKEN as string, {
    expiresIn: '7d'
  })
}
