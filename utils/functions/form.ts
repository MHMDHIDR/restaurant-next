import { fileRequestProps } from '../../types'
import formidable from 'formidable'

export default async function formHandler(req: fileRequestProps) {
  const data = await new Promise((resolve, reject) => {
    const form = formidable()

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject({ err })
      resolve({ err, fields, files })
    })
  })

  return data
}
