import { NextApiResponse } from 'next'
import { authUserRequestProps } from '../types/index.js'
import { verify, JwtPayload } from 'jsonwebtoken'
import UserModel from '../models/User.js'

const protect = (handler: any) => {
  return async (req: authUserRequestProps, res: NextApiResponse) => {
    const { JWT_SECRET } = process.env
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1]
        const decoded: authUserRequestProps['user'] | JwtPayload | string = verify(
          token,
          JWT_SECRET!
        )

        // Get user from the token and put it in the request object to be used in the next middleware
        req.user = await UserModel.findById(decoded._id).select('-userPassword')
      } catch (error) {
        res.status(401).json({ message: 'Please authenticate.' })
        throw new Error('Not authorized')
      }
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' })
      throw new Error('Not authorized, no token')
    }

    return handler(req, res)
  }
}

export default protect
