import { notFound } from "next/navigation"
import { UserRole, UserRoleType } from "@/server/db/schema"

/**
 * Checks if a user has the required role(s) to access a resource
 * @param user - The user role to check
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns true if access should be granted, calls notFound() otherwise
 */
export function checkRoleAccess(
  userRole: UserRoleType | undefined,
  allowedRoles: readonly UserRoleType[],
): boolean {
  if (!userRole || !allowedRoles.includes(userRole)) {
    notFound()
  }

  return true
}
