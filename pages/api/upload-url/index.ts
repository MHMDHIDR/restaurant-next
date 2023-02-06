import S3 from 'aws-sdk/clients/s3'
import { NextApiResponse } from 'next'
import { fileRequestProps } from '../../../types'

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { AWS_ACCESS_ID, AWS_SECRET, AWS_BUCKET_NAME } = process.env
  const s3 = new S3({
    accessKeyId: AWS_ACCESS_ID || '',
    secretAccessKey: AWS_SECRET || '',
    signatureVersion: 'v4',
    region: 'us-east-1'
  })

  const files = req.query.file
  console.log(files)

  // const uploadToS3 = async (key: string, fileType: string) => {
  //   const params = {
  //     Fields: { key, 'Content-Type': fileType },
  //     Expires: 600,
  //     Bucket: AWS_BUCKET_NAME
  //   }

  //   return s3.createPresignedPost(params)
  // }

  // if (!files) return

  // const filesURLs = files.map((file: any, idx: number) => {
  //   return uploadToS3(file[idx].name, file[idx].type)
  // })

  // res.status(200).json(filesURLs)
}
