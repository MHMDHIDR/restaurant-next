import axios from 'axios'
import { API_URL } from '../constants'
import { FileUploadProps, FoodImgsProps, uploadurlDataProps } from '../types'

/**
 * Custom hook to upload files to S3 bucket
 * and returns foodImgs object (array)
 */

const useUploadS3 = async (file: FileUploadProps['file']) => {
  const fileFormData = new FormData()

  const fileData = stringJson(
    file.map((file: { name: string; type: string }) => {
      return {
        key: file?.name,
        type: file?.type
      }
    })
  )

  const { data }: uploadurlDataProps = await axios.get(
    `${API_URL}/uploadurl?file=${fileData}`
  )

  async function uploadToS3(url: string) {
    await axios.post(url, fileFormData)
  }

  data.map(({ fields, url }: any, idx: number) => {
    Object.entries({ ...fields, file: file[idx] }).forEach(([key, value]) => {
      fileFormData.set(key, value as string)
    })
    return uploadToS3(url)
  })

  const foodImgs: FoodImgsProps[] = data.map(({ fields, url }) => {
    const urlSplit = (n: number) => url.split('/')[n]
    return {
      foodImgDisplayName: fields.key,
      foodImgDisplayPath: `${urlSplit(0)}//${fields.bucket}.${urlSplit(2)}/${fields.key}`
    }
  })

  return { foodImgs }
}

export default useUploadS3
