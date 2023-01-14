import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import FoodModel from '../../../models/Foods'
import paginatedResults from '../../../middleware/paginatedResults'
import { fileRequestProps } from '../../../types'
import sharp from 'sharp'
import { S3 } from 'aws-sdk'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID || '',
    secretAccessKey: AWS_SECRET || ''
  }
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method, body, files } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const foods = await paginatedResults(FoodModel, req, res)
        res.status(200).json(foods)
      } catch (error) {
        res.json('Failed to get food!' + error)
      }
      break
    }

    case 'POST': {
      const { foodName, foodPrice, category, foodDesc, foodToppings, foodTags } = body
      const { foodImg } = files
      const toppings = foodToppings && JSON.parse(foodToppings)
      const tags = JSON.parse(foodTags)
      const foodImgs = foodImg && Array.isArray(foodImg) ? foodImg : [foodImg]
      const foodImgNames = foodImgs?.map(
        img => crypto.randomUUID() + img.name.split('.')[0] + '.webp'
      )

      const uploadToS3 = async (img: any, imgName: string) => {
        const params = {
          Bucket: AWS_BUCKET_NAME || '',
          Key: imgName,
          Body: img,
          ContentType: 'image/webp'
        }
        const imgUpload = await s3.upload(params).promise()
        return imgUpload.Location
      }

      const foodImgUrls = await Promise.all(
        foodImgs.map(async (img, index) => {
          const foodImgDisplayName = foodImgNames[index]
          const foodImgDisplayPath = await uploadToS3(img.data, foodImgDisplayName)
          return { foodImgDisplayName, foodImgDisplayPath }
        })
      )

      await FoodModel.create({
        foodName,
        foodPrice: parseInt(foodPrice),
        category,
        foodDesc,
        foodToppings: {
          toppingName: toppings.toppingName,
          toppingPrice: parseInt(toppings.toppingPrice)
        },
        foodTags: tags,
        foodImgs: foodImgUrls.map(({ foodImgDisplayName, foodImgDisplayPath }) => {
          return {
            foodImgDisplayName,
            foodImgDisplayPath
          }
        })
      })
      res.status(201).json({
        foodAdded: 1,
        message: 'Food added successfully'
      })
      break
    }

    case 'PATCH': {
      const { foodName, foodPrice, foodDesc, foodToppings, foodTags, category } = req.body
      const prevFoodImgPathsAndNames = JSON.parse(req.body.prevFoodImgPathsAndNames)

      const toppings = foodToppings && JSON.parse(foodToppings)
      const tags = JSON.parse(foodTags)
      const { foodId } = req.params

      //if the user has uploaded a new image
      if (req.files) {
        const { foodImg } = req.files
        const foodImgs = foodImg && Array.isArray(foodImg) ? foodImg : [foodImg]
        const foodImgNames = foodImgs?.map(
          img => crypto.randomUUID() + img.name.split('.')[0] + '.webp'
        )

        let foodImgDisplayPath = prevFoodImgPathsAndNames.map(
          ({ foodImgDisplayPath }) => foodImgDisplayPath
        )
        let foodImgDisplayName = prevFoodImgPathsAndNames.map(
          ({ foodImgDisplayName }) => foodImgDisplayName
        )

        //delete the old images from s3 bucket using the prevFoodImgPathsAndNames
        // const Objects = prevFoodImgPathsAndNames.map(({ foodImgDisplayName }) => ({
        //   Key: foodImgDisplayName
        // }))

        // s3.deleteObjects(
        //   {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Delete: { Objects }
        //   },
        //   (error, data) => {
        //     if (error) {
        //       res.json({
        //         message: error,
        //         foodUpdated: 0
        //       })
        //       return
        //     }
        //   }
        // )

        //if no error in deleting old image, then upload the new image to s3 bucket by using the new foodImgs sharp
        foodImgs.map((img, index) => {
          sharp(img.data)
            .resize(600)
            .webp({ lossless: true })
            .toBuffer()
            .then(newWebpImg => {
              //changing the old jpg image buffer to new webp buffer
              img.data = newWebpImg

              const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: foodImgNames[index],
                Body: newWebpImg,
                ContentType: 'image/webp'
              } //uploading the new webp image to s3 bucket, self executing function
              ;(async () => {
                try {
                  const { Location } = await s3.upload(params).promise()

                  //saving the new image path to the database
                  foodImgDisplayPath.push(Location)
                  foodImgDisplayName.push(Location.split('.com/')[1])
                  if (index === foodImgs.length - 1) {
                    await FoodsModel.findByIdAndUpdate(
                      foodId,
                      {
                        foodImgs: foodImgs.map((_img, index) => ({
                          foodImgDisplayName: foodImgDisplayName[index],
                          foodImgDisplayPath: foodImgDisplayPath[index]
                        })),
                        foodName,
                        foodPrice,
                        category,
                        foodDesc,
                        foodToppings: toppings,
                        foodTags: tags,
                        updatedAt: Date.now()
                      },
                      { new: true }
                    )
                    res.json({
                      message: 'Food Updated Successfully',
                      foodUpdated: 1
                    })
                    return
                  }
                } catch (error) {
                  res.json({
                    message: error,
                    foodUpdated: 0
                  })
                  return
                }
              })()
            })
            .catch(err => {
              res.json({
                message: `Sorry! Something went wrong, check the error => 😥: \n ${err}`,
                foodUpdated: 0
              })
            })
        })
        //==========================================================
      } else {
        try {
          await FoodsModel.findByIdAndUpdate(foodId, {
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
          return
        } catch (error) {
          res.json({
            message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
            foodUpdated: 0
          })
          return
        }
      }
      break
    }

    case 'DELETE': {
      const { foodId, imgName } = req.params

      if (imgName) {
        s3.deleteObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imgName
          },
          async (err, data) => {
            if (err) {
              res.json({
                message: error,
                ImgDeleted: 0
              })
              return
            }

            try {
              //find the food and delete the img by using the imgName
              const food = await FoodsModel.findById(foodId)
              const foodImgs = food.foodImgs.filter(
                img => img.foodImgDisplayName !== imgName
              )
              await FoodsModel.findByIdAndUpdate(foodId, { foodImgs })

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
        const prevFoodImgPathsAndNames = JSON.parse(req.body.prevFoodImgPathsAndNames)
        //delete the old images from s3 bucket using the prevFoodImgPathsAndNames
        const Objects = prevFoodImgPathsAndNames.map(({ foodImgDisplayName }) => ({
          Key: foodImgDisplayName
        }))

        s3.deleteObjects(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects }
          },
          async (error, data) => {
            if (error) {
              res.json({
                message: error,
                foodDeleted: 0
              })
              return
            }

            try {
              await FoodsModel.findByIdAndDelete(foodId)

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
