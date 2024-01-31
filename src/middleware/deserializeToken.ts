import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../utils/jwt'

const deserializeToken = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.replace(/^Bearer\s/, '')
  if (!accessToken) return next()

  const { decoded, expired }: any = verifyJWT(accessToken)
  if (decoded) {
    res.locals.user = decoded
    return next()
  }

  if (expired) {
    return next()
  }

  return next()
}

export default deserializeToken
