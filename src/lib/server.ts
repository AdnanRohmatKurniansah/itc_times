import express, { type Request, type Application, type Response, type NextFunction, Router } from 'express'
import cors from 'cors'
import { UserRoute } from '../routes/user.route'
import { TagRoute } from '../routes/tag.route'
import { AnnouncementRoute } from '../routes/announcement.route'
import { CommentRoute } from '../routes/comment.route'

const createServer = () => {
  const app: Application = express()

  const apiV1 = Router()

  app.use(express.urlencoded({ extended: false }))

  app.use(express.json())

  app.use(
    cors({
      origin: ['*'],
      // credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
      // allowedHeaders: ['Content-Type', 'Authorization']
    })
  )

  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      message: 'Welcome to ITC Times API',
      status: 'OK',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  })

  apiV1.use('/user', UserRoute)
  apiV1.use('/tag', TagRoute)
  apiV1.use('/announcement', AnnouncementRoute)
  apiV1.use('/comment', CommentRoute)

  app.use('/api/v1', apiV1)

  return app
}

export default createServer
