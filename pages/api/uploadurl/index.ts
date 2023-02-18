import S3 from 'aws-sdk/clients/s3'
import { randomUUID } from 'crypto'
import { NextApiResponse } from 'next'
import { fileRequestProps } from '@types'
import { parseJson } from 'functions/jsonTools'
const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME, AWS_REGION } = process.env
const s3 = new S3({
  accessKeyId: AWS_ACCESS_ID,
  secretAccessKey: AWS_SECRET,
  signatureVersion: 'v4',
  region: AWS_REGION
})

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method, query } = req
  const { file }: any = query

  switch (method) {
    case 'GET': {
      const filesKeyType: fileRequestProps[] = parseJson(file || '[]')

      const uploadToS3 = async (key: string, type: string) => {
        const params = {
          Fields: { key: randomUUID() + key, 'Content-Type': type },
          Expires: 600,
          Bucket: AWS_BUCKET_NAME
        }
        return new Promise((resolve, reject) => {
          s3.createPresignedPost(params, (err, signed) => {
            if (err) return reject(err)
            resolve(signed)
          })
        })
      }

      if (!file || filesKeyType.length === 0)
        return res.status(500).json({ message: 'No file uploaded' })

      const foodImgUrls = await Promise.all(
        filesKeyType.map(
          async ({ key, type }: fileRequestProps) => await uploadToS3(key, type)
        )
      )

      res.status(200).json(foodImgUrls)

      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
