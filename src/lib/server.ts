import express, { type Request, type Application, type Response, type NextFunction, Router } from 'express'
import cors from 'cors'
import { UserRoute } from '../routes/user.route'
import { TagRoute } from '../routes/tag.route'
import { AnnouncementRoute } from '../routes/announcement.route'
import { CommentRoute } from '../routes/comment.route'
import fs from 'fs'
import path from 'path'

const createServer = () => {
  const swaggerFile = fs.readFileSync(path.join(__dirname, '../../docs/swagger.json'), 'utf-8')
  const swaggerDocument = JSON.parse(swaggerFile)
  const app: Application = express()

  const apiV1 = Router()

  app.use(express.urlencoded({ extended: false }))

  app.use(express.json())

  // app.use(
  //   cors({
  //     origin: ['*'],
  //     // credentials: true,
  //     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  //     // allowedHeaders: ['Content-Type', 'Authorization']
  //   })
  // )
  app.use(
    cors({
      origin: ['*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )

  app.get('/api-docs/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument)
  })

  app.get('/api-docs', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ITC Times - API Docs</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
          <style>
            html { box-sizing: border-box; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin: 0; background: #fafafa; }
          </style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js" crossorigin></script>
          <script>
            window.onload = function () {
              SwaggerUIBundle({
                url: '/api-docs/swagger.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                plugins: [SwaggerUIBundle.plugins.DownloadUrl],
                layout: 'StandaloneLayout',
                persistAuthorization: true,
                deepLinking: true,
                displayRequestDuration: true,
                filter: true,
              })
            }
          </script>
        </body>
      </html>`)
  })

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
