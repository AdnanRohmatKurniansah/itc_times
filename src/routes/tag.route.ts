import { Router } from 'express'
import { Create, Delete, GetAll, GetById, GetBySlug, Update } from '../controllers/tag.controller'
import { checkRole, userAuthenticate } from '../middlewares/user.auth'

export const TagRoute: Router = Router()

// Public routes
TagRoute.get('/', GetAll)
TagRoute.get('/:tagId', GetById)

TagRoute.get('/slug/:slug', GetBySlug)

// Protected Routes
TagRoute.use(userAuthenticate, checkRole(['kadiv']))

TagRoute.post('/create', Create)
TagRoute.put('/update/:tagId', Update)
TagRoute.delete('/delete/:tagId', Delete)
