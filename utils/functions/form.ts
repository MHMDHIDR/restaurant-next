import { fileRequestProps } from '../../types'
import formidable from 'formidable'

export default async function formHandler(req: fileRequestProps) {
  return await new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true
    })

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject({ err })
      resolve({ err, fields, files })
    })
  })
}
