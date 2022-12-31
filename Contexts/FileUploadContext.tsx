import { useEffect, useState, createContext } from 'react'
import { FileUploadProps } from '../types'

export const FileUploadContext = createContext({} as FileUploadProps)

const FileUploadContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [file, setFile] = useState<File[]>([])
  const [fileURLs, setFileURLs] = useState([])

  const onFileAdd = (e: { target: { files: any } }) =>
    setFile(file => [...file, ...e.target.files])

  const onFileRemove = (fileUrl: string, fileName: string) => {
    setFileURLs(fileURLs.filter(url => url !== fileUrl))
    setFile(file.filter(file => file.name !== fileName))
  }

  useEffect(() => {
    if (file.length < 1) return

    const newFileUrls = []
    file.forEach(file => {
      if (Math.ceil(file.size / 1000000) < 2) {
        newFileUrls.push(URL.createObjectURL(file))
      }
      setFileURLs(newFileUrls)
    })
  }, [file])

  return (
    <FileUploadContext.Provider
      value={{
        file,
        fileURLs,
        setFileURLs,
        onFileAdd,
        onFileRemove
      }}
    >
      {children}
    </FileUploadContext.Provider>
  )
}

export default FileUploadContextProvider
