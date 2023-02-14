import type { NextApiRequest, NextApiResponse } from 'next'
import SettingsModel from '@models/Settings'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const logo = await SettingsModel.find().select('websiteLogoDisplayPath -_id')
  res.status(200).send(
    `<body
        style='overflow:hidden;word-spacing:2rem;height:100vh;display:grid;place-items:center;background-color:#222'>
        <h1 style='font-size:3em;font-weight:bold;color:white'>
          WELCOME TO RESTAURANT API
        </h1>
        <img src='${logo[0].websiteLogoDisplayPath}' />
      </body>`
  )
}
