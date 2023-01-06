import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import SettingsModel from '../../../models/settings'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        // const settings = await SettingsModel.find({})
        const settings = await paginatedResults(SettingsModel, req, res)
        res.status(200).json(settings)
      } catch (error) {
        res.json('Failed to get settings!' + error)
      }
      break

    default:
      break
  }
}
