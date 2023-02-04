import { NextApiResponse } from 'next'
import fs from 'fs'
import dbConnect from '../../../utils/db'
import FoodModel from '../../../models/Foods'
import paginatedResults from '../../../middleware/paginatedResults'
import { fileRequestProps } from '../../../types'
import S3 from 'aws-sdk/clients/s3'
import formHandler from '../../../utils/functions/form'
import crypto from 'crypto'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID || '',
    secretAccessKey: AWS_SECRET || ''
  }
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
      const { fields, files }: any = await formHandler(req)
      const { foodName, foodPrice, category, foodDesc, foodToppings, foodTags } = fields
      const { foodImg } = files

      const toppings = foodToppings && JSON.parse(foodToppings)

      const tags = JSON.parse(foodTags)
      const foodImgs = foodImg && Array.isArray(foodImg) ? foodImg : [foodImg]

      const foodImgNames = foodImgs?.map(
        img => crypto.randomUUID() + img.originalFilename.split('.')[0] + '.webp'
      )
      const foodImgPathes = foodImgs?.map(({ filepath }) => filepath)

      // const uploadToS3 = async (imgName: string, imgPath: string) => {
      const params = {
        Bucket: AWS_BUCKET_NAME,
        // Key: imgName,
        // ContentType: 'image/webp'
        Fields: {
          Key: foodImgs,
          'Content-Type': 'image/webp'
        }
      }
      const post = s3.createPresignedPost(params)
      console.log(post)

      res.status(200).json(post)
      // }

      // const foodImgUrls = await Promise.all(
      //   foodImgs.map(async (_, index) => {
      //     const foodImgDisplayName = foodImgNames[index]
      //     const foodImgURL = foodImgPathes[index]

      //     const foodImgDisplayPath = await uploadToS3(foodImgDisplayName, foodImgURL)

      //     return { foodImgDisplayName, foodImgDisplayPath }
      //   })
      // )

      // await FoodModel.create({
      //   foodName,
      //   foodPrice: parseInt(foodPrice),
      //   category,
      //   foodDesc,
      //   foodToppings: {
      //     toppingName: toppings.toppingName,
      //     toppingPrice: parseInt(toppings.toppingPrice)
      //   },
      //   foodTags: tags,
      //   foodImgs: foodImgUrls.map(({ foodImgDisplayName, foodImgDisplayPath }) => {
      //     return {
      //       foodImgDisplayName,
      //       foodImgDisplayPath
      //     }
      //   })
      // })
      // res.status(201).json({
      //   foodAdded: 1,
      //   message: 'Food added successfully'
      // })

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
