import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import SettingsModel from '../../../models/Settings'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const settings = await paginatedResults(SettingsModel, req, res)
        res.status(200).json(settings)
      } catch (error) {
        res.json('Failed to get settings!' + error)
      }
      break
    }

    case 'PATCH': {
      const _id = req.params.id
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
      } = req.body
      const categories = JSON.parse(CategoryList)

      //if not valid _id then return error message
      if (!mongoose.Types.ObjectId.isValid(_id)) {
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
          Bucket: process.env.AWS_BUCKET_NAME,
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

        //upload the new image to s3 bucket
        sharp(websiteLogo.data)
          .rotate()
          .resize(600)
          .webp({ lossless: true })
          .toBuffer()
          .then(newWebpImg => {
            //changing the old jpg image buffer to new webp buffer
            websiteLogo.data = newWebpImg

            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: websiteLogoName,
              Body: newWebpImg,
              ContentType: 'image/webp'
            } //uploading the new webp image to s3 bucket, self executing function
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
          })
          .catch(({ message }) => {
            res.json({
              message,
              settingsUpdated: 0
            })
            return
          })
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
