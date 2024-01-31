import { Router } from 'express'
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/product.controller'
import { requireAdmin } from '../middleware/auth'

export const ProductRouter: Router = Router()

// http://localhost:4000/product
ProductRouter.get('/', getProducts)
ProductRouter.get('/:id', getProducts)
ProductRouter.post('/', requireAdmin, createProduct)
ProductRouter.put('/:id', requireAdmin, updateProduct)
ProductRouter.delete('/:id', requireAdmin, deleteProduct)
