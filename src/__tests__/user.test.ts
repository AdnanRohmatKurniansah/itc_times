import { prisma } from '../lib/prisma'
import createServer from '../lib/server'
import supertest from 'supertest'

const app = createServer()

describe('authentication', () => {
  afterAll(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await supertest(app).post('/api/auth/register').send({
        name: 'Adnan',
        email: 'test@example.com',
        password: 'password123'
      })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Register successfully')
    })

    it('should handle registration validation errors', async () => {
      const response = await supertest(app).post('/api/auth/register').send({
        name: '',
        email: 'test@example.com',
        password: 'password123'
      })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const response = await supertest(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Login successfully')
    })

    it('should handle login validation errors', async () => {
      const response = await supertest(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: ''
      })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Validation failed')
    })
  })
})
