import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import UsersModel from '../../../models/User'
import { authUserRequestProps } from '../../../types'

export default async function handler(req: authUserRequestProps, res: NextApiResponse) {
  const { method } = req

  dbConnect()

  switch (method) {
    case 'GET': {
      const { _id, userEmail, userAccountType } = await UsersModel.findById(req.user._id)

      res.status(200).json({
        _id,
        userEmail,
        userAccountType
      })
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
