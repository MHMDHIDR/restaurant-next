import { fileRequestProps } from '@types'
import formidable from 'formidable'
import { NextApiRequest } from 'next'

export default async function formHandler(req: fileRequestProps | NextApiRequest) {
  return await new Promise((resolve, reject) => {
    const form = formidable({ multiples: true })

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject({ err })
      resolve({ err, fields, files })
    })
  })
}
