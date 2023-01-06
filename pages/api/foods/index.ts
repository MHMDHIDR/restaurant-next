import { NextApiRequest, NextApiResponse } from 'next'
import paginatedResults from '../../../middleware/paginatedResults'
import FoodsModel from '../../../models/food'
import connectMongo from '../../../utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      try {
        await connectMongo()
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
