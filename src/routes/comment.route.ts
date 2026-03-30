import { Router } from 'express'
import { checkRole, userAuthenticate } from '../middlewares/user.auth'
import {
  GetAnnouncementComments,
  GetById,
  Create,
  Update,
  Delete
} from '../controllers/comment.controller'

export const CommentRoute: Router = Router()

// Public routes
CommentRoute.get('/:commentId', userAuthenticate, GetById)

CommentRoute.get('/announcement/:announcementId', GetAnnouncementComments)

// Protected routes
CommentRoute.post('/create', userAuthenticate, checkRole(['kadiv', 'user']), Create)

CommentRoute.put('/update/:commentId', userAuthenticate, checkRole(['kadiv', 'user']),Update)
CommentRoute.delete('/delete/:commentId', userAuthenticate, checkRole(['kadiv', 'user']),Delete)
