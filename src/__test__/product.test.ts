import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import createServer from '../utils/server'
import { v4 as uuidv4 } from 'uuid'
import { addProductToDB } from '../services/product.service'
import { createUser } from '../services/auth.service'
import { hashing } from '../utils/hashing'

const app = createServer()

const productPayload = {
  product_id: uuidv4(),
  name: 'Jersey Homebois X Onic',
  price: 279999,
  size: 'M'
}

const productPayloadCreate = {
  product_id: uuidv4(),
  name: 'Jersey Homebois X Onic Preloved',
  price: 279999,
  size: 'M'
}

const productPayloadUpdate = {
  price: 259999,
  size: 'XL'
}

const userAdminCreated = {
  user_id: uuidv4(),
  name: 'Yanda Agil',
  email: 'yandaagil@gmail.com',
  password: `${hashing('12345')}`,
  role: 'admin'
}

const userRegularCreated = {
  user_id: uuidv4(),
  name: 'Yanda Agil',
  email: 'yandaagil123@gmail.com',
  password: `${hashing('12345')}`,
  role: 'regular'
}

const userAdmin = {
  email: 'yandaagil@gmail.com',
  password: '12345'
}

const userRegular = {
  email: 'yandaagil123@gmail.com',
  password: '12345'
}

describe('product', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    await addProductToDB(productPayload)
    await createUser(userAdminCreated)
    await createUser(userRegularCreated)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('get products', () => {
    describe('given the product does exist', () => {
      it('it should return 200 and all product data', async () => {
        const { statusCode } = await supertest(app).get('/product')

        expect(statusCode).toBe(200)
      })
    })
  })

  describe('get detail product', () => {
    describe('given the product does not exist', () => {
      it('it should return 404 and empty data', async () => {
        const productId = 'PRODUCT_123'
        await supertest(app).get(`/product/${productId}`).expect(404)
      })
    })

    describe('given the product does exist', () => {
      it('it should return 200 and detail product data', async () => {
        const { statusCode, body } = await supertest(app).get(`/product/${productPayload.product_id}`)

        expect(statusCode).toBe(200)
        expect(body.data.name).toBe('Jersey Homebois X Onic')
      })
    })
  })

  describe('create product', () => {
    describe('if user is not logged in', () => {
      it('it should return 403, request forbidden', async () => {
        const { statusCode } = await supertest(app).post('/product').send(productPayloadCreate)

        expect(statusCode).toBe(403)
      })
    })

    describe('if user is logged in as admin', () => {
      it('it should return 201, create product success', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .post('/product')
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadCreate)
          .expect(201)
      })

      it('it should return 422, product already exist', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .post('/product')
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadCreate)
          .expect(422)
      })
    })

    describe('if user is logged in as regular', () => {
      it('it should return 403, request forbidden', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userRegular)
        await supertest(app)
          .post('/product')
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadCreate)
          .expect(403)
      })
    })
  })

  describe('update product', () => {
    describe('if user is not logged in', () => {
      it('it should return 403, request forbidden', async () => {
        const { statusCode } = await supertest(app).put(`/product/${productPayload.product_id}`)

        expect(statusCode).toBe(403)
      })
    })

    describe('if user is logged in as admin', () => {
      it('it should return 201, update product success', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .put(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadUpdate)
          .expect(201)

        const updatedData = await supertest(app).get(`/product/${productPayload.product_id}`)
        expect(updatedData.body.data.price).toBe(259999)
        expect(updatedData.body.data.size).toBe('XL')
      })

      it('it should return 404, product does not exist', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .put('/product/product_34')
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadUpdate)
          .expect(404)
      })
    })

    describe('if user is logged in as regular', () => {
      it('it should return 403, request forbidden', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userRegular)
        await supertest(app)
          .put(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .send(productPayloadUpdate)
          .expect(403)
      })
    })
  })

  describe('delete product', () => {
    describe('if user is not logged in', () => {
      it('it should return 403, request forbidden', async () => {
        const { statusCode } = await supertest(app).delete(`/product/${productPayload.product_id}`)

        expect(statusCode).toBe(403)
      })
    })

    describe('if user is logged in as admin', () => {
      it('it should return 200, delete product success', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .delete(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .expect(200)
      })

      it('it should return 404, product does not exist', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userAdmin)
        await supertest(app)
          .delete('/product/product_34')
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .expect(404)
      })
    })

    describe('if user is logged in as regular', () => {
      it('it should return 403, request forbidden', async () => {
        const { body } = await supertest(app).post('/auth/login').send(userRegular)
        await supertest(app)
          .delete(`/product/${productPayload.product_id}`)
          .set('Authorization', `Bearer ${body.data.accessToken}`)
          .expect(403)
      })
    })
  })
})
