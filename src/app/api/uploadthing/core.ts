import { createUploadthing } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"
import { auth } from "@/server/auth"
import { utapi } from "@/server/uploadthing"
import type { FileRouter } from "uploadthing/next"

const createUT = createUploadthing()

export const ourFileRouter = {
  imageUploader: createUT({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .input(z.object({ objectType: z.string(), objectId: z.string() }))
    .middleware(async ({ input }) => {
      const session = await auth()
      if (!session?.user) throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" })

      const { objectType, objectId } = input

      const objectDirectory = `${objectType}/${objectId}`

      // List all files
      const existingFiles = await utapi.listFiles()

      const objectFiles = existingFiles.files.filter(
        file => file.status === "Uploaded" && file.name.startsWith(objectDirectory),
      )

      // Delete existing files for this object
      if (objectFiles.length > 0) {
        const fileKeys = objectFiles.map(file => file.key)
        await utapi.deleteFiles(fileKeys)
      }

      return {
        userId: session.user.id,
        userName: session.user.name,
        objectDirectory,
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
