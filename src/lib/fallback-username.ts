import { type Session } from "next-auth"

/**
 * This function takes a username and returns a fallback username
 * Which is the first letter of each word in the username
 * @param username
 * @returns
 */
export function fallbackUsername(username: Session["user"]["name"]) {
  return (username ?? "User")
    .split(" ")
    .map(name => name[0])
    .join("")
}
