import {
  UserChangePasswordSchema,
  UserLoginSchema,
  UserProfileUpdateSchema,
  UserRegisterSchema
} from './../validations/user.validation'
import { type Request, type Response } from 'express'
import { compare, hash } from 'bcrypt'
import { UserAccessToken } from '../utils/generateToken'
import { prisma } from '../lib/prisma'
import { errorResponse, logError, successResponse } from '../utils/response'
import {
  CreateUser,
  GetUniqueUser,
  GetUser,
  GetUserByFilter,
  GetUserWithPassword,
  UpdateUser,
  UpdateUserRole
} from '../services/user.service'
import { UserToken } from '../types'
import { deleteFromCloudinary, uploadToCloudinary } from '../lib/cloudinary'
import { sendEmail } from '../utils/email'
import { randomBytes } from 'crypto'

export const Register = async (req: Request, res: Response) => {
  try {
    const requestData = await req.body

    const validationData = UserRegisterSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    const { confirmPassword, ...userData } = validationData.data

    const userExist = await GetUniqueUser(requestData.email)

    if (userExist) {
      return errorResponse(res, 'Email already exist', 409)
    }

    const hashedPassword = await hash(requestData.password, 10)

    const user = await CreateUser({
      ...userData,
      role: 'user',
      password: hashedPassword
    })
    return successResponse(res, 'User Data created successfully', user)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Login = async (req: Request, res: Response) => {
  try {
    const requestData = await req.body

    const validationData = UserLoginSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    const userExist = await GetUniqueUser(requestData.email)

    if (!userExist) {
      return errorResponse(res, 'User doesnt exist', 404)
    }

    const auth = await compare(requestData.password, userExist.password)

    if (auth) {
      const access_token: string = UserAccessToken({
        id: userExist.id,
        fullname: userExist.fullname,
        email: userExist.email,
        photo: userExist.photo,
        role: userExist.role,
        tokenVersion: userExist.tokenVersion
      })

      return successResponse(res, 'Login successfully', {
        access_token
      })
    } else {
      return errorResponse(res, 'Invalid credentials', 401)
    }
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetProfile = async (req: Request, res: Response) => {
  try {
    const extendedReq = req as Request & { user: UserToken }

    const user = await GetUser(extendedReq.user.id)

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    return successResponse(res, 'User data', user)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const Logout = async (req: Request, res: Response) => {
  const extendedReq = req as Request & { user: UserToken }

  await prisma.user.update({
    where: {
      id: extendedReq.user.id
    },
    data: {
      tokenVersion: extendedReq.user.tokenVersion + 1
    }
  })

  return successResponse(res, 'Logout Successfully')
}

export const UpdateProfile = async (req: Request, res: Response) => {
  try {
    const extendedReq = req as Request & { user: UserToken }
    const userId = extendedReq.user.id

    const requestData = req.body
    const imageFile = req.file

    const validationData = UserProfileUpdateSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    const user = await GetUser(userId)

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    let photoUrl = user.photo

    if (imageFile) {
      if (user.photo) {
        await deleteFromCloudinary(user.photo)
      }
      photoUrl = await uploadToCloudinary(imageFile, 'user-images')
    }

    const payload = {
      fullname: validationData.data.fullname ?? user.fullname,
      photo: photoUrl
    }

    const updatedUser = await UpdateUser(userId, payload)

    return successResponse(res, 'Profile updated successfully', updatedUser)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const extendedReq = req as Request & {
      user: UserToken
    }
    const userId = extendedReq.user.id

    const requestData = await req.body

    const validationData = UserChangePasswordSchema.safeParse(requestData)

    if (!validationData.success) {
      return errorResponse(res, 'Validation failed', 400, validationData.error.flatten().fieldErrors)
    }

    const user = await GetUserWithPassword(userId)

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    const auth = await compare(requestData.old_password, user.password)

    if (!auth) {
      return errorResponse(res, 'Current password is incorrect', 422)
    }

    const hashedPassword = await hash(requestData.new_password, 10)

    const payload = {
      password: hashedPassword
    }

    const updatedUser = await UpdateUser(userId, payload)

    return successResponse(res, 'Password changed successfully', updatedUser)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const GetUsersAdmin = async (req: Request, res: Response) => {
  try {
    const { keyword = '', role = '', page = 1, sortBy = 'newest', limit = 10 } = req.query

    const users = await GetUserByFilter(String(keyword), String(role), Number(page), String(sortBy), Number(limit))

    return successResponse(res, 'User filter data', users.data, 200,
      {
        total: users.total,
        page: Number(page),
        limit: Number(limit)
      }
    )
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const ChangeUserRole = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const { role } = req.body

    if (!role) {
      return errorResponse(res, 'Role is required', 400)
    }

    const updatedUser = await UpdateUserRole(id, role)

    return successResponse(res, 'User role updated', updatedUser)
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) return errorResponse(res, 'Email is required', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return errorResponse(res, 'User not found', 404)

    if (!['user', 'kadiv'].includes(user.role)) {
      return errorResponse(res, 'You are not allowed to reset password', 403)
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) 

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    })

    await sendEmail(
      email,
      'Reset Password',
      `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2 style="color:#333;">Reset Password Request</h2>
        <p>Click link below to reset your password:</p>
        <a href="#"
           style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>
        <p style="color:#888;">This link will expire in 1 hour. (Link Frontend Page, I Fill Blank. Please post resetToken to body request /user/reset-password #)</p>
      </div>
      `
    )

    return successResponse(res, 'Reset password email sent', {
      resetToken: token
    })
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, new_password } = req.body
    if (!token || !new_password) return errorResponse(res, 'Token and new password are required', 400)

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) return errorResponse(res, 'Invalid or expired token', 400)

    if (!['user', 'kadiv'].includes(user.role)) {
      return errorResponse(res, 'You are not allowed to reset password', 403)
    }

    const hashedPassword = await hash(new_password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return successResponse(res, 'Password reset successfully')
  } catch (error) {
    logError(error)
    return errorResponse(res, 'Internal server error', 500)
  }
}