import { Key, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { FileUploadContext } from '../Contexts/FileUploadContext'

import { FileUploadProps } from '../types'

const FileUpload = ({ data }) => {
  const { file, fileURLs, onFileRemove, onFileAdd } =
    useContext<FileUploadProps>(FileUploadContext)
  let { pathname } = useLocation()

  return (
    <>
      <div
        className={`flex flex-wrap justify-center gap-5 py-3 overflow-y-auto bg-gray-100 rounded-lg cursor-pointer dark:bg-gray-700 w-[30rem]`}
      >
        {
          //if there's no image in Preview (fileURLs) AND no images in the data base
          fileURLs.length === 0 && data.defaultImg.length === 0 ? (
            <div
              className={`flex items-center flex-col gap-y-3 max-h-44 h-44 place-content-center`}
            >
              <img
                src={`https://source.unsplash.com/random?food`}
                alt={`Delicious Food`}
                className='object-cover p-1 border border-gray-400 w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl'
              />
            </div>
          ) : //if there's image in Preview (fileURLs)
          fileURLs.length > 0 ? (
            fileURLs.map((fileURL: string, index: Key) => (
              <div
                key={index}
                className={`flex items-center flex-col gap-y-3 max-h-44 h-44 place-content-center`}
              >
                <img
                  loading='lazy'
                  src={fileURL}
                  alt={data?.foodName}
                  className={`object-cover p-1 border border-gray-400 max-w-[7rem] w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl`}
                />
                <button
                  type='button'
                  className='px-6 py-1 text-white transition-colors bg-red-500 rounded-full hover:bg-red-700'
                  onClick={() => onFileRemove(fileURL, file[index].name)}
                >
                  حذف
                </button>
              </div>
            ))
          ) : (
            //if there's images in the data base
            data.defaultImg.length > 0 &&
            data.defaultImg.map(
              ({ foodImgDisplayName, foodImgDisplayPath }, index: Key) => (
                <div
                  key={index}
                  className={`flex items-center flex-col gap-y-3 max-h-44 h-44 place-content-center`}
                >
                  <img
                    src={foodImgDisplayPath}
                    alt={foodImgDisplayName}
                    className='object-cover p-1 border border-gray-400 w-28 min-h-fit h-28 dark:border-gray-300 rounded-xl'
                  />
                  <button
                    type='button'
                    id='deleteImg'
                    className='px-6 py-1 text-white transition-colors bg-red-500 rounded-full hover:bg-red-700'
                    data-img-name={foodImgDisplayName}
                  >
                    حذف
                  </button>
                </div>
              )
            )
          )
        }
      </div>

      {pathname.split('/')[2].includes('edit-food') && (
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
