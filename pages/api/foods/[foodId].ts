import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import FoodModel from '../../../models/Foods'
import { fileRequestProps, FoodImgsProps, ToppingsProps } from '../../../types'
import { S3 } from 'aws-sdk'
import formHandler from '../../../utils/functions/form'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID || '',
    secretAccessKey: AWS_SECRET || ''
  }
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method, query, body } = req
  const { foodId } = query
  const { fields }: any = await formHandler(req)
  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const { foodName, foodPrice, category, foodDesc, foodTags, foodToppings } = fields
      // const prevFoodImgPathsAndNames = JSON.parse(body.prevFoodImgPathsAndNames)
      const tags = JSON.parse(foodTags)
      const toppings = JSON.parse(foodToppings).map(
        ({ toppingName, toppingPrice }: ToppingsProps) => {
          return {
            toppingName,
            toppingPrice: Number(toppingPrice)
          }
        }
      )

      //if the user has uploaded a new image
      // if (req.files) {
      //   const { foodImg } = req.files
      //   const foodImgs = foodImg && Array.isArray(foodImg) ? foodImg : [foodImg]
      //   const foodImgNames = foodImgs?.map(
      //     img => crypto.randomUUID() + img.name.split('.')[0] + '.webp'
      //   )

      //   let foodImgDisplayPath = prevFoodImgPathsAndNames.map(
      //     ({ foodImgDisplayPath }: FoodImgsProps) => foodImgDisplayPath
      //   )
      //   let foodImgDisplayName = prevFoodImgPathsAndNames.map(
      //     ({ foodImgDisplayName }: FoodImgsProps) => foodImgDisplayName
      //   )

      //   //delete the old images from s3 bucket using the prevFoodImgPathsAndNames
      //   // const Objects = prevFoodImgPathsAndNames.map(({ foodImgDisplayName }) => ({
      //   //   Key: foodImgDisplayName
      //   // }))

      //   // s3.deleteObjects(
      //   //   {
      //   //     Bucket: process.env.AWS_BUCKET_NAME,
      //   //     Delete: { Objects }
      //   //   },
      //   //   (error, data) => {
      //   //     if (error) {
      //   //       res.json({
      //   //         message: error,
      //   //         foodUpdated: 0
      //   //       })
      //   //       return
      //   //     }
      //   //   }
      //   // )

      //   //if no error in deleting old image, then upload the new image to s3 bucket by using the new foodImgs sharp
      //   foodImgs.map((img, index) => {
      //     sharp(img.data)
      //       .resize(600)
      //       .webp({ lossless: true })
      //       .toBuffer()
      //       .then(newWebpImg => {
      //         //changing the old jpg image buffer to new webp buffer
      //         img.data = newWebpImg

      //         const params = {
      //           Bucket: process.env.AWS_BUCKET_NAME || '',
      //           Key: foodImgNames[index],
      //           Body: newWebpImg,
      //           ContentType: 'image/webp'
      //         } //uploading the new webp image to s3 bucket, self executing function
      //         ;(async () => {
      //           try {
      //             const { Location } = await s3.upload(params).promise()

      //             //saving the new image path to the database
      //             foodImgDisplayPath.push(Location)
      //             foodImgDisplayName.push(Location.split('.com/')[1])
      //             if (index === foodImgs.length - 1) {
      //               await FoodModel.findByIdAndUpdate(
      //                 foodId,
      //                 {
      //                   foodImgs: foodImgs.map((_img, index) => ({
      //                     foodImgDisplayName: foodImgDisplayName[index],
      //                     foodImgDisplayPath: foodImgDisplayPath[index]
      //                   })),
      //                   foodName,
      //                   foodPrice,
      //                   category,
      //                   foodDesc,
      //                   foodToppings: toppings,
      //                   foodTags: tags,
      //                   updatedAt: Date.now()
      //                 },
      //                 { new: true }
      //               )
      //               res.json({
      //                 message: 'Food Updated Successfully',
      //                 foodUpdated: 1
      //               })
      //               return
      //             }
      //           } catch (error) {
      //             res.json({
      //               message: error,
      //               foodUpdated: 0
      //             })
      //             return
      //           }
      //         })()
      //       })
      //       .catch(err => {
      //         res.json({
      //           message: `Sorry! Something went wrong, check the error => 😥: \n ${err}`,
      //           foodUpdated: 0
      //         })
      //       })
      //   })
      //   //==========================================================
      // } else {
      try {
        await FoodModel.findByIdAndUpdate(foodId, {
          foodName,
          foodPrice,
          category,
          foodDesc,
          foodToppings: toppings,
          foodTags: tags,
          updatedAt: Date.now()
        })

        res.json({
          message: 'Food Updated Successfully',
          foodUpdated: 1
        })
      } catch (error) {
        res.json({
          message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
          foodUpdated: 0
        })
      }
      // }
      break
    }

    case 'DELETE': {
      const { imgName }: any = query

      if (imgName) {
        s3.deleteObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Key: imgName
          },
          async (error, _data) => {
            if (error) {
              res.json({
                message: error,
                ImgDeleted: 0
              })
              return
            }

            try {
              //find the food and delete the img by using the imgName
              const food = await FoodModel.findById(foodId)
              const foodImgs = food.foodImgs.filter(
                (img: { foodImgDisplayName: string | string[] }) =>
                  img.foodImgDisplayName !== imgName
              )
              await FoodModel.findByIdAndUpdate(foodId, { foodImgs })

              res.json({
                message: 'Image Deleted Successfully',
                ImgDeleted: 1
              })
              return
            } catch (error) {
              res.json({
                message: `Sorry! Something went wrong while deleting Image, check the error => 😥: \n ${error}`,
                ImgDeleted: 0
              })
              return
            }
          }
        )
      } else {
        const { prevFoodImgPathsAndNames } = fields

        //delete the old images from s3 bucket using the prevFoodImgPathsAndNames
        const Objects = JSON.parse(prevFoodImgPathsAndNames).map(
          ({ foodImgDisplayName }: FoodImgsProps) => ({
            Key: foodImgDisplayName
          })
        )

        s3.deleteObjects(
          {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Delete: { Objects }
          },
          async (error, _data) => {
            if (error) {
              res.json({
                message: error,
                foodDeleted: 0
              })
            }

            try {
              await FoodModel.findByIdAndDelete(foodId)

              res.json({
                message: 'Food Deleted Successfully',
                foodDeleted: 1
              })
              return
            } catch (error) {
              res.json({
                message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
                foodDeleted: 0
              })
              return
            }
          }
        )
      }
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
