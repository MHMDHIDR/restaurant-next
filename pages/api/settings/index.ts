import { NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import SettingsModel from '../../../models/Settings'
import { Types } from 'mongoose'
import paginatedResults from '../../../middleware/paginatedResults'
import { fileRequestProps } from '@types'
import sharp from 'sharp'
import { S3 } from 'aws-sdk'

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_ID || '',
    secretAccessKey: process.env.AWS_SECRET || ''
  }
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
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

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
