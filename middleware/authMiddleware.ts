import { verify } from 'jsonwebtoken'
import UserModel from '../models/User.js'
import { NextApiResponse } from 'next'
import { authUserRequestProps } from '../types/index.js'

const protect = async (
  req: authUserRequestProps,
  res: NextApiResponse,
  next: () => void
) => {
  const { JWT_SECRET } = process.env
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      interface JwtPayload {
        _id: string
      }
      // Verify token
      const { _id } = verify(token, JWT_SECRET as string) as JwtPayload

      // Get user from the token and put it in the request object to be used in the next middleware
      req.user = await UserModel.findOne({ _id, 'tokens.token': token }).select(
        '-userPassword'
      )
      // req.user = await UserModel.findById(decoded.id).select('-userPassword')

      next()
    } catch (error) {
      res.status(401).json({ message: 'Please authenticate.' })
      throw new Error('Not authorized')
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
    throw new Error('Not authorized, no token')
  }
}

export default protect
