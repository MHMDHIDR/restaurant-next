import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import UsersModel from '@models/User'
import { Types } from 'mongoose'
import { authUserRequestProps } from '@types'

export default async function handler(req: authUserRequestProps, res: NextApiResponse) {
  const { method, body, query } = req

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

    case 'PATCH': {
      const { userId }: any = query
      const { userAccountAction } = body

      //if not valid id then return error message
      if (!Types.ObjectId.isValid(userId)) {
        return res.json({ message: `Sorry, No User with this ID => ${userId}` })
      }

      //else update the user status
      try {
        await UsersModel.findByIdAndUpdate(
          userId,
          //check if its a change of status or type
          userAccountAction === 'active' || userAccountAction === 'block'
            ? { userAccountStatus: userAccountAction }
            : { userAccountType: userAccountAction },
          { new: true }
        )

        res.status(200).json({
          message: 'User Status Updated Successfully',
          userUpdated: 1
        })
      } catch (error) {
        res.status(404).json({ message: error, userUpdated: 0 })
      }
      break
    }

    case 'DELETE': {
      const { userId } = query

      try {
        await UsersModel.findByIdAndDelete(userId)

        res.json({
          message: 'User Deleted Successfully',
          userDeleted: 1
        })
      } catch (error) {
        res.json({
          message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
          userDeleted: 0
        })
      }
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
