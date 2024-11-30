"use server"

import sharp from "sharp"

/**
 * Get the blur placeholder of an image, used for lazy loading
 * @param imageSrc The source of the image
 * @returns The blur placeholder of the image
 */
export async function getBlurPlaceholder(imageSrc: string): Promise<string | null> {
  const response = await fetch(imageSrc)
  if (response.status !== 200) return null

  const buffer = await response.arrayBuffer()
  const { data, info } = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .toBuffer({ resolveWithObject: true })

  const base64 = `data:image/${info.format};base64,${data.toString("base64")}`
  return base64
}
