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
      if (!session!.user) throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" })
      const user = session!.user

      const usersDirectory = `users/${user.id}`

      // List all files
      const existingFiles = await utapi.listFiles()

      const userFiles = existingFiles.files.filter(
        file => file.status === "Uploaded" && file.name.startsWith(usersDirectory),
      )

      // Delete only  existing files
      if (userFiles.length > 0) {
        const fileKeys = userFiles.map(file => file.key)
        await utapi.deleteFiles(fileKeys)
      }

      return { userId: user.id, userName: user.name, usersDirectory }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const update = {
          fileKey: file.key,
          newName: `${metadata.usersDirectory}/${file.name}`,
        }
        await utapi.renameFiles(update)

        return {
          uploadedBy: `${metadata.userName} (${metadata.userId})`,
        }
      } catch (error) {
        console.error("Error during upload:", error)
        throw new UploadThingError({ code: "UPLOAD_FAILED", message: "Upload process failed" })
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
