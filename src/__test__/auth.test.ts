import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import createServer from '../utils/server'
import { v4 as uuidv4 } from 'uuid'
import { createUser } from '../services/auth.service'
import { hashing } from '../utils/hashing'

const app = createServer()

const userAdmin = {
  user_id: uuidv4(),
  name: 'Yanda Agil',
  email: 'yandaagil@gmail.com',
  password: `${hashing('12345')}`,
  role: 'admin'
}

const userRegular = {
  user_id: uuidv4(),
  name: 'Yanda Agil',
  email: 'yandaagil123@gmail.com',
  password: `${hashing('12345')}`,
  role: 'regular'
}

const userAdminCreated = {
  name: 'Yanda Agil',
  email: 'yanda@gmail.com',
  password: '12345',
  role: 'admin'
}

const userRegularCreated = {
  name: 'Yanda Agil',
  email: 'yanda123@gmail.com',
  password: '12345'
}

const userAdminLogin = {
  email: 'yandaagil@gmail.com',
  password: '12345'
}

const userNotExist = {
  email: 'yandaagil1234@gmail.com',
  password: '12345'
}

describe('auth', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    await createUser(userAdmin)
    await createUser(userRegular)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('register', () => {
    describe('create user admin', () => {
      it('should return 201, success create user admin', async () => {
        await supertest(app).post('/auth/register').send(userAdminCreated).expect(201)
      })
    })

    describe('create user regular', () => {
      it('should return 201, success create user regular', async () => {
        await supertest(app).post('/auth/register').send(userRegularCreated).expect(201)
      })
    })
  })

  describe('login', () => {
    describe('login when user exist', () => {
      it('should return 200, return access token & refresh token', async () => {
        await supertest(app).post('/auth/login').send(userAdminLogin).expect(200)
      })
    })

    describe('login when user does not exist', () => {
      it('should return 422, login failed', async () => {
        await supertest(app).post('/auth/login').send(userNotExist).expect(422)
      })
    })
  })
})
