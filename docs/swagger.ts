import swaggerJsdoc from 'swagger-jsdoc'
import { BASE_URL } from '../src/config/index'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation using Swagger and TypeScript'
    },
    servers: [
      {
        url: BASE_URL
      }
    ]
  },
  apis: ['./src/routes/*.ts']
}

export const swaggerSpec = swaggerJsdoc(options)
