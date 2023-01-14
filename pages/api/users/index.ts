import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import UsersModel from '../../../models/User'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  dbConnect()

  switch (method) {
    case 'GET': {
      const users = await paginatedResults(UsersModel, req, res)
      res.status(200).json(users)
      break
    }

    case 'POST': {
      break
    }

    case 'PATCH': {
      break
    }

    case 'DELETE': {
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
