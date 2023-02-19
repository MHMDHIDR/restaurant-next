import { NextApiResponse } from 'next'
import dbConnect from 'utils/db'
import UsersModel from 'models/User'
import { authUserRequestProps } from '@types'
import { parseJson } from 'utils/functions/jsonTools'

export default async function handler(req: authUserRequestProps, res: NextApiResponse) {
  const { method, headers } = req
  const userEmail = parseJson(headers.user as string).email

  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const User: any = await UsersModel.find({ userEmail })
        res.status(200).json(User[0])
      } catch (error) {
        res.status(500).json({
          message: `Sorry something went wrong!: ${error}`
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

export const config = {
  api: { bodyParser: false }
}
