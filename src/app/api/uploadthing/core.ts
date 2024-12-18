import { createUploadthing } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@/server/auth"
import { utapi } from "@/server/uploadthing"
import type { FileRouter } from "uploadthing/next"

const createUT = createUploadthing()

export const ourFileRouter = {
  imageUploader: createUT({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" })

      // List all files
      const existingFiles = await utapi.listFiles()

      // Check for existing files based on the user's profile image URL
      const userProfileImageKey = session.user.image ? session.user.image.split("/").pop() : null // Extract the key from the URL
      const objectFiles = existingFiles.files.filter(file => {
        return file.status === "Uploaded" && file.key === userProfileImageKey // Check if the file key matches the user's profile image key
      })

      // Delete existing files for this object
      if (objectFiles.length > 0) {
        const fileKeys = objectFiles.map(file => file.key)
        await utapi.deleteFiles(fileKeys)
      }

      return {
        userId: session.user.id,
        userName: session.user.name,
        objectDirectory: "", // Initialize or define this variable appropriately
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const update = {
          fileKey: file.key,
          newName: `${metadata.objectDirectory}/${file.name}`,
        }
        await utapi.renameFiles(update)

        return {
          uploadedBy: `${metadata.userName} (${metadata.userId})`,
          path: metadata.objectDirectory,
        }
      } catch (error) {
        console.error("Error during upload:", error)
        throw new UploadThingError({ code: "UPLOAD_FAILED", message: "Upload process failed" })
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
