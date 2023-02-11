import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import FoodModel from '../../../models/Foods'
import paginatedResults from '../../../middleware/paginatedResults'
import { fileRequestProps, ToppingsProps } from '../../../types'
import formHandler from '../../../utils/functions/form'

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const foods = await paginatedResults(FoodModel, req, res)
        res.status(200).json(foods)
      } catch (error) {
        res.json('Failed to get food!: ' + error)
      }
      break
    }

    case 'POST': {
      const { fields }: any = await formHandler(req)
      const {
        foodName,
        foodPrice,
        category,
        foodDesc,
        foodToppings,
        foodTags,
        foodImgUrls
      } = fields
      const toppings = foodToppings && JSON.parse(foodToppings)
      const tags = JSON.parse(foodTags)
      const foodImgs = JSON.parse(foodImgUrls)

      await FoodModel.create({
        foodName,
        foodPrice: parseInt(foodPrice),
        category,
        foodDesc,
        foodToppings: toppings.map(({ toppingName, toppingPrice }: ToppingsProps) => {
          return {
            toppingName,
            toppingPrice: Number(toppingPrice)
          }
        }),
        foodTags: tags,
        foodImgs
      })

      res.status(201).json({
        foodAdded: 1,
        message: 'Food added successfully'
      })

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
