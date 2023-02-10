import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import FoodModel from '../../../models/Foods'
import paginatedResults from '../../../middleware/paginatedResults'
import { fileRequestProps } from '../../../types'
import S3 from 'aws-sdk/clients/s3'
import { randomUUID } from 'crypto'
import formHandler from '../../../utils/functions/form'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  accessKeyId: AWS_ACCESS_ID || '',
  secretAccessKey: AWS_SECRET || '',
  signatureVersion: 'v4',
  region: 'us-east-1'
})

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
      const { foodName, foodPrice, category, foodDesc, foodToppings, foodTags } = fields
      const toppings = foodToppings && JSON.parse(foodToppings)
      const tags = JSON.parse(foodTags)

      await FoodModel.create({
        foodName,
        foodPrice: parseInt(foodPrice),
        category,
        foodDesc,
        foodToppings: {
          toppingName: toppings.toppingName,
          toppingPrice: parseInt(toppings.toppingPrice)
        },
        foodTags: tags
        // ,foodImgs: foodImgUrls.map(({ foodImgDisplayName, foodImgDisplayPath }) => {
        //   return {
        //     foodImgDisplayName,
        //     foodImgDisplayPath
        //   }
        // })
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
