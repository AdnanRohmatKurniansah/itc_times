import { Router } from 'express'
import {
  Login,
  Logout,
  UpdateProfile,
  ChangePassword,
  Register,
  GetProfile,
  ChangeUserRole,
  GetUsersAdmin,
  ForgotPassword,
  ResetPassword
} from '../controllers/user.controller'
import { upload } from '../middlewares/upload.middleware'
import { checkRole, userAuthenticate } from '../middlewares/user.auth'

export const UserRoute: Router = Router()

// Public routes
UserRoute.post('/login', Login)
UserRoute.post('/register', Register)

UserRoute.post('/forgot-password', ForgotPassword)
UserRoute.post('/reset-password', ResetPassword)

// Protected Routes
UserRoute.use(userAuthenticate)

// All
UserRoute.post('/logout', Logout)

// User & Kadiv
UserRoute.get('/profile', GetProfile)
UserRoute.post('/update-profile', checkRole(['user', 'kadiv']), upload.single('photo'), UpdateProfile)
UserRoute.post('/change-password', checkRole(['user', 'kadiv']), ChangePassword)

// Admin
UserRoute.get('/list', checkRole(['admin']), GetUsersAdmin)
UserRoute.put('/update-role/:id', checkRole(['admin']), ChangeUserRole)
