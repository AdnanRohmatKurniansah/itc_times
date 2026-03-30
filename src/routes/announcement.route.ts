import { Router } from 'express'
import { upload } from '../middlewares/upload.middleware'
import { Create, Delete, GetAll, GetById, GetBySlug, Update } from '../controllers/announcement.controller'
import { checkRole, userAuthenticate } from '../middlewares/user.auth'

export const AnnouncementRoute: Router = Router()

// Public routes
AnnouncementRoute.get('/', GetAll)
AnnouncementRoute.get('/:announcementId', GetById)
AnnouncementRoute.get('/slug/:slug', GetBySlug)

// Protected Routes
AnnouncementRoute.use(userAuthenticate, checkRole(['kadiv']))

AnnouncementRoute.post('/create', upload.single('image_url'), Create)
AnnouncementRoute.put('/update/:announcementId', upload.single('image_url'), Update)
AnnouncementRoute.delete('/delete/:announcementId', Delete)
