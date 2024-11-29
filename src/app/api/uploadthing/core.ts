import { auth } from "@/server/auth";
import { utapi } from "@/server/uploadthing";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session!.user)
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Unauthorized",
        });
      const user = session!.user;

      const userDirectory = `${user.name}/${user.id}`;

      // List all files
      const existingFiles = await utapi.listFiles();

      const userFiles = existingFiles.files.filter(
        (file) =>
          file.status === "Uploaded" && file.name.startsWith(userDirectory),
      );

      // Delete only  existing files
      if (userFiles.length > 0) {
        const fileKeys = userFiles.map((file) => file.key);
        await utapi.deleteFiles(fileKeys);
      }

      return { userId: user.id, userName: user.name, userDirectory };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const update = {
          fileKey: file.key,
          newName: `${metadata.userDirectory}/${file.name}`,
        };
        await utapi.renameFiles(update);

        return {
          uploadedBy: `${metadata.userName} (${metadata.userId})`,
          uploadedFile: {
            key: update.newName,
            name: file.name,
            url: file.url,
          },
        };
      } catch (error) {
        console.error("Error during upload:", error);
        throw new UploadThingError({
          code: "UPLOAD_FAILED",
          message: "Upload process failed",
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
