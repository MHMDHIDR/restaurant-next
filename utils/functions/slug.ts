/* A function to create a slug making the text from (this is text) => (this-is-text) */
export const createSlug = (txt: string) =>
  txt
    ?.replace(/[^A-Za-z0-9أ-ي -]/g, '') // remove invalid chars
    ?.replace(/\s+/g, '-') // collapse whitespace and replace by -
    ?.replace(/-+/g, '-') // collapse dashes replace with one dash
    ?.toLowerCase() //

/* A function to remove all dashes */
export const removeSlug = (txt: string) => txt?.replace(/-/g, ' ')
