import Image from 'next/image'
import { useRouter } from 'next/router'
import { FileUploadContext } from 'contexts/FileUploadContext'
import { FileUploadComponentProps, FileUploadProps, FoodImgsProps } from '@types'
import { FILE_UPLOAD_IMG_SIZE } from '@constants'
import { useContext } from 'react'

const FileUpload = ({ data, ignoreDelete }: FileUploadComponentProps) => {
  const { file, fileURLs, onFileRemove, onFileAdd } =
    useContext<FileUploadProps>(FileUploadContext)
  let { id } = useRouter().query
  const hasImgs =
    data.defaultImg[0].foodImgDisplayName!?.length > 0 ||
    data.defaultImg[0].websiteLogoDisplayName!?.length > 0

  return (
    <>
      <label
        htmlFor='foodImg'
        className={`flex flex-wrap justify-center gap-5 py-3 overflow-y-auto bg-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer dark:bg-gray-700 hover:dark:bg-gray-600 w-[30rem] transition-colors duration-300`}
      >
        {
          //if there's no image in Preview (fileURLs) AND no images in the data base
          fileURLs.length === 0 && data.defaultImg?.length === 0 ? (
            <div
              className={`flex items-center flex-col gap-y-3 max-h-44 h-44 place-content-center`}
            >
              <Image
                loading='lazy'
                src={`https://source.unsplash.com/random?food`}
                alt={`Delicious Food`}
                height={FILE_UPLOAD_IMG_SIZE}
                width={FILE_UPLOAD_IMG_SIZE}
                className='object-cover p-1 border border-gray-400 w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl'
              />
            </div>
          ) : //if there's image in Preview (fileURLs)
          fileURLs.length > 0 ? (
            fileURLs.map((fileURL: string, index: number) => (
              <div
                key={fileURL}
                className={`flex items-center flex-col gap-y-3 max-h-44 h-44 place-content-center`}
              >
                <Image
                  loading='lazy'
                  src={fileURL}
                  alt={data?.foodName || `Delicious Food`}
                  height={FILE_UPLOAD_IMG_SIZE}
                  width={FILE_UPLOAD_IMG_SIZE}
                  className={`object-cover p-1 border border-gray-400 max-w-[7rem] w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl`}
                />
                <button
                  type='button'
                  className='px-6 py-1 text-white transition-colors bg-red-500 rounded-full hover:bg-red-700'
                  onClick={() => onFileRemove(fileURL, file[index]?.name)}
                >
                  حذف
                </button>
              </div>
            ))
          ) : (
            data.defaultImg.map(
              (
                { foodImgDisplayName, foodImgDisplayPath }: FoodImgsProps,
                idx: number
              ) => (
                <div
                  className={`flex flex-col items-center gap-y-3 max-h-44 h-44 place-content-center`}
                  key={data.foodId || idx}
                >
                  <Image
                    loading='lazy'
                    src={foodImgDisplayPath || `https://source.unsplash.com/random?food`}
                    alt={foodImgDisplayName || `Delicious Food`}
                    height={FILE_UPLOAD_IMG_SIZE}
                    width={FILE_UPLOAD_IMG_SIZE}
                    className='object-cover p-1 border border-gray-400 w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl'
                  />
                  {hasImgs && !ignoreDelete && (
                    <button
                      type='button'
                      id='deleteImg'
                      className='px-6 py-1 text-white transition-colors bg-red-500 rounded-full hover:bg-red-700'
                      data-img-name={foodImgDisplayName}
                    >
                      حذف
                    </button>
                  )}
                </div>
              )
            )
          )
        }
      </label>

      {id && (
        <p className='text-center text-green-700 dark:text-green-400'>
          لا تنسى الضغط على زر تحديث أسفل الصفحة لتحميل الصور
        </p>
      )}

      <input
        type='file'
        name='foodImg'
        id='foodImg'
        className='p-3 text-lg text-white transition-colors bg-orange-800 cursor-pointer rounded-xl hover:bg-orange-700'
        accept='image/*'
        onChange={onFileAdd}
        multiple
        required
      />
    </>
  )
}

export default FileUpload
