import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import FoodsModel from '../../../models/Food'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const foods = await paginatedResults(FoodsModel, req, res)
        res.status(200).json(foods)
      } catch (error) {
        res.json('Failed to get food!' + error)
      }
      break
    }

    default:
      break
  }
}
