import { NextApiRequest, NextApiResponse } from 'next'

import SettingsModel from '../../../models/settings'
import dbConnect from '../../../utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (await dbConnect()) {
      const settings = await SettingsModel.find()
      res.status(200).json(settings)
    }
  } catch (err) {
    res.status(500).json(err)
  }
}
