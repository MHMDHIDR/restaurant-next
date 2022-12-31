import { NextApiRequest, NextApiResponse } from 'next'
import paginatedResults from '../../../middleware/paginatedResults'

import FoodsModel from '../../../models/food'
import dbConnect from '../../../utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  dbConnect()

  switch (method) {
    case 'GET': {
      const foods = await paginatedResults(FoodsModel, req, res)

      res.status(200).json(foods)
    }
  }
}
