import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@utils/db'
import SettingsModel from '@models/Settings'
import { S3 } from 'aws-sdk'
import formHandler from '@utils/functions/form'
import { parseJson } from '@functions/jsonTools'

const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_ID ?? '',
    secretAccessKey: AWS_SECRET ?? ''
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const { fields }: any = await formHandler(req)
  const {
    appName,
    appDesc,
    appTagline,
    orderMsgSuccess,
    orderMsgFailure,
    whatsAppNumber,
    instagramAccount,
    twitterAccount,
    CategoryList,
    foodImgs,
    prevLogoImgName
  } = fields

  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const { id }: any = query
      const categories = parseJson(CategoryList)

      s3.deleteObject(
        {
          Bucket: AWS_BUCKET_NAME!,
          Key: prevLogoImgName
        },
        async (error, _data) => {
          if (error) return res.json({ message: error, settingsUpdated: 0 })

          console.log({
            websiteLogoDisplayName: parseJson(foodImgs)[0].foodImgDisplayName,
            websiteLogoDisplayPath: parseJson(foodImgs)[0].foodImgDisplayPath,
            id
          })

          try {
            await SettingsModel.findByIdAndUpdate(
              id,
              {
                websiteLogoDisplayName: parseJson(foodImgs)[0].foodImgDisplayName,
                websiteLogoDisplayPath: parseJson(foodImgs)[0].foodImgDisplayPath,
                appName,
                appDesc,
                appTagline,
                whatsAppNumber,
                instagramAccount,
                twitterAccount,
                CategoryList: categories,
                orderMsg: {
                  Success: orderMsgSuccess,
                  Failure: orderMsgFailure
                }
              },
              { new: true }
            )

            res.json({ message: 'تم تحديث الإعدادات بنجاح', settingsUpdated: 1 })
          } catch (error) {
            res.json({
              message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
              settingsUpdated: 0
            })
          }
        }
      )

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
