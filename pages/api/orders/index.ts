import { NextApiRequest, NextApiResponse } from 'next'
import paginatedResults from '../../../middleware/paginatedResults'
import OrdersModel from '../../../models/orders'
import connectMongo from '../../../utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      try {
        await connectMongo()
        const orders = await paginatedResults(OrdersModel, req, res)
        res.status(200).json(orders)
      } catch (error) {
        res.json('Failed to get orders!' + error)
      }
      break
    }

    default:
      break
  }
}
