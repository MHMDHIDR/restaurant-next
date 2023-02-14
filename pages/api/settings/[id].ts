import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import SettingsModel from '@models/Settings'
import { Types } from 'mongoose'
import paginatedResults from '@middleware/paginatedResults'
import { fileRequestProps } from '@types'
import { S3 } from 'aws-sdk'
import { parseJson } from '@functions/jsonTools'

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_ID || '',
    secretAccessKey: process.env.AWS_SECRET || ''
  }
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method, body, query } = req
  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const _id: any = query.id

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
        prevLogoImgPath,
        prevLogoImgName
      } = body
      const categories = parseJson(CategoryList)

      //if not valid _id then return error message
      if (!Types.ObjectId.isValid(_id)) {
        return res.json({ message: `Sorry, No settings with this ID => ${_id}` })
      }

      const { websiteLogo } = req.files || ''
      const websiteLogoName =
        crypto.randomUUID() + websiteLogo?.name.split('.')[0] + '.webp' || ''
      let websiteLogoDisplayPath = prevLogoImgPath
      let websiteLogoDisplayName = prevLogoImgName

      if (websiteLogo) {
        //delete the old image from s3 bucket
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME || '',
          Key: websiteLogoDisplayName
        }

        s3.deleteObject(params, (err, _data) => {
          if (err) {
            res.json({
              message: err,
              settingUpdated: 0
            })
            return
          }
        })
        ;(async () => {
          const { Location } = await s3.upload(params).promise()

          //saving the new image path to the database
          websiteLogoDisplayPath = Location
          websiteLogoDisplayName = Location.split('.com/')[1]

          await SettingsModel.findByIdAndUpdate(_id, {
            websiteLogoDisplayPath,
            websiteLogoDisplayName,
            appName,
            appDesc,
            appTagline,
            orderMsg: {
              Success: orderMsgSuccess,
              Failure: orderMsgFailure
            },
            whatsAppNumber,
            instagramAccount,
            twitterAccount,
            CategoryList: categories
          })

          res.json({
            message: 'تم تحديث الإعدادات بنجاح',
            settingsUpdated: 1
          })
          return
        })()
      } else {
        //else do this
        try {
          await SettingsModel.findByIdAndUpdate(_id, {
            appName,
            appDesc,
            appTagline,
            orderMsg: {
              Success: orderMsgSuccess,
              Failure: orderMsgFailure
            },
            whatsAppNumber,
            instagramAccount,
            twitterAccount,
            CategoryList: categories
          })

          res.json({ message: 'تم تحديث الإعدادات بنجاح', settingsUpdated: 1 })
        } catch (error) {
          res.json({
            message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
            settingsUpdated: 0
          })
        }
      }
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
