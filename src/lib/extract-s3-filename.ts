/**
 * Extracts the S3 file key from a full S3 URL
 * @param url The full S3 URL (e.g., https://s3.eu-west-2.amazonaws.com/bucket-name/path/to/file)
 * @returns The file key (e.g., path/to/file) or null if parsing fails
 */
export function extractS3FileName(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    // Remove the leading slash from pathname and skip the bucket name
    const pathParts = parsedUrl.pathname.slice(1).split("/")
    // Join all parts after the bucket name to get the file key
    const fileKey = pathParts.slice(1).join("/")
    return fileKey || null
  } catch (error) {
    console.error("Failed to parse S3 URL:", error)
    return null
  }
}
