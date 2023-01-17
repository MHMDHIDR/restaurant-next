import { verify } from 'jsonwebtoken'
// import UserModel from '../models/User.js'
// import { NextApiResponse } from 'next'
// import { authUserRequestProps } from '../types/index.js'

// const protect = (handler: any) => {
//   return async (req: any, res: any) => {
//     const { JWT_SECRET } = process.env
//     let token

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       try {
//         token = req.headers.authorization.split(' ')[1]
//         const decoded = verify(token, JWT_SECRET!)
//         interface JwtPayload {
//           decoded: { _id: string }
//         }
//         req.user = await UserModel.findById(decoded._id).select('-userPassword')
//       } catch (error) {
//         res.status(401).json({ message: 'Please authenticate.' })
//         throw new Error('Not authorized')
//       }
//     }

//     //if no token provided then throw an error
//     if (!token) {
//       res.status(401).json({ message: 'Not authorized, no token' })
//       throw new Error('Not authorized, no token')
//     }

//     return handler(req, res)
//   }
// }

// export default protect
