import { NextApiRequest, NextApiResponse } from 'next'
import paginatedResults from '../../../middleware/paginatedResults'

import FoodsModel from '../../../models/food'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      // const foods = await FoodsModel.find()
      const foods = paginatedResults(FoodsModel)
      console.log(foods)
      res.status(200).json(foods)
    }
  }
}
