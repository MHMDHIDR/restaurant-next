import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import OrdersModel from '../../../models/Orders'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
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
