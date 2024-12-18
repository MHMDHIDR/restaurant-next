"use client"

import { generateReactHelpers } from "@uploadthing/react"
import { forwardRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

type FileSelectUploadProps = {
  endpoint: keyof OurFileRouter
  isSelectButton?: boolean
  onFileSelect?: (file: File | null) => void
  onUploadComplete?: (res: Array<{ url: string }>) => void
  className?: string
  required?: boolean
  name?: string
}

export const FileSelectUpload = forwardRef<HTMLInputElement, FileSelectUploadProps>(
  (
    {
      endpoint,
      isSelectButton = false,
      onFileSelect,
      onUploadComplete,
      className,
      required = false,
      name = "fileInput",
    },
    ref,
  ) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const toast = useToast()

    const { startUpload, isUploading } = useUploadThing(endpoint, {
      onClientUploadComplete: res => {
        setSelectedFile(null)

        // Call the original onUploadComplete if provided
        onUploadComplete?.(res)

        toast.success("Upload Completed")
      },
      onUploadError: error => {
        toast.error(`ERROR! ${error.message}`)
        setSelectedFile(null)
      },
    })

    const handleFileUpload = async () => {
      if (selectedFile) {
        await startUpload([selectedFile])
      }
    }

    return isSelectButton ? (
      <div className="relative">
        <input
          ref={ref}
          name={name}
          id={name}
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0] ?? null
            setSelectedFile(file)
            onFileSelect?.(file)
          }}
          className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />
        <Label htmlFor={name} className={`pressable ${className}`} aria-disabled={isUploading}>
          Select File
        </Label>
      </div>
    ) : (
      <UploadButton endpoint="imageUploader" onClientUploadComplete={handleFileUpload} />
    )
  },
)

FileSelectUpload.displayName = "FileSelectUpload"
