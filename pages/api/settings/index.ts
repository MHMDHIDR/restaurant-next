import { NextApiRequest, NextApiResponse } from 'next'
import paginatedResults from '../../../middleware/paginatedResults'
import SettingsModel from '../../../models/settings'
import connectMongo from '../../../utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET': {
      try {
        await connectMongo()
        const settings = await paginatedResults(SettingsModel, req, res)
        res.status(200).json(settings)
      } catch (error) {
        res.json('Failed to get orders!' + error)
      }
      break
    }

    default:
      break
  }
}
