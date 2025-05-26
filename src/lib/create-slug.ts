/** A function to create a slug
 * making the text from (this is text) => (this-is-text)
 * @param txt the text to be converted to slug
 * @returns the slug
 */
export function createSlug(txt: string) {
  return txt
    .replace(/[^A-Za-z0-9أ-ي -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes replace with one dash
    .replace(/-$/, "") // remove trailing dash if any
    .toLowerCase() //
}

/**
 * A function to unslug a string
 * making the text from (this-is-text) => (this is text)
 * @param slug the slug to be converted to text
 * @returns the text
 */
export function unslug(slug: string) {
  return slug
    .trim() // remove leading and trailing space
    .replace(/-/g, " ") // replace dashes with space
    .replace(/([a-z])([A-Z])/g, "$1 $2") // add space between camelCase words
    .replace(/\s+/g, " ") // collapse multiple spaces into one
}
