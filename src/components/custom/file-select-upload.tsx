"use client"

import { generateReactHelpers } from "@uploadthing/react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

type FileSelectUploadProps = {
  endpoint: keyof OurFileRouter
  isSelectButton?: boolean
  onFileSelect?: (file: File | null) => void
  onUploadComplete?: (res: Array<{ url: string }>) => void
  input: { objectType: string; objectId: string }
  className?: string
}

export function FileSelectUpload({
  endpoint,
  isSelectButton = false,
  onFileSelect,
  onUploadComplete,
  input,
  className,
}: FileSelectUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const toast = useToast()

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: res => {
      // Reset selected file after upload
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
      await startUpload([selectedFile], input)
    }
  }

  if (isSelectButton) {
    return (
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0] ?? null
            setSelectedFile(file)
            onFileSelect?.(file)
          }}
          className={className}
        />
        {selectedFile && (
          <div className="mt-2 text-sm text-muted-foreground">
            Selected file: {selectedFile.name}
            <button
              onClick={handleFileUpload}
              disabled={isUploading}
              className="ml-2 text-blue-500 hover:underline"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
