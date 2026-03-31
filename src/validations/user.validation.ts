import z from 'zod'

export const UserLoginSchema = z.object({
  email: z.email().min(1, 'Email is required').max(150, 'Max Character 150'),
  password: z.string().min(4, 'Password must be at least 4 characters')
})

export const UserRegisterSchema = z.object({
    fullname: z.string().min(1, 'Fullname is required').max(255, 'Max Character 255'),
    email: z.email().min(1, 'Email is required').max(150, 'Max Character 150'),
    password: z.string().min(6, 'Password must be at least 6 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/, 
        'Password must contain letters, numbers, and special characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword']
})

export const UserProfileUpdateSchema = z.object({
  fullname: z.string().min(8, 'Fullname is required').max(255, 'Max Character 255').optional()
})

export const UserChangePasswordSchema = z.object({
  old_password: z.string().min(6, 'Old Password must be at least 6 characters'),
  new_password: z.string().min(6, 'New Password must be at least 6 characters')
})

export const ForgotPasswordRequestSchema = z.object({
  email: z.email().min(1, 'Email is required').max(150, 'Max Character 150'),
})

export const ResetPasswordSchema = z.object({
  token: z.email().min(1, 'Token is required'),
  new_password: z.string().min(6, 'New Password must be at least 6 characters'),
})