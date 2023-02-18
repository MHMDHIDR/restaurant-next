import { NextApiRequest, NextApiResponse } from 'next'
import email from 'functions/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  switch (method) {
    case 'POST': {
      const { name, subject, from, to, msg } = body

      if (name === '' || from === '' || to === '' || msg === '') {
        res.status(400)
        return
      }

      try {
        const emailData = {
          name,
          subject,
          from,
          to,
          msg
        }

        const { accepted, rejected } = await email(emailData)
        if (accepted.length > 0) {
          res.status(200).json({
            message: 'Email Sent Successfully',
            mailSent: 1
          })
        } else if (rejected.length > 0) {
          res.status(400).json({
            message: `Sorry, rejected! ==> ${rejected[0] /*.message*/}`,
            mailSent: 0
          })
        }
      } catch (error) {
        res.json({ message: `Ooops!, something went wrong!: ${error} `, mailSent: 0 })
      }

      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
