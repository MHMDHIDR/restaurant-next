"use server"

import { signOut } from "@/server/auth"

export async function handleLogout() {
  await signOut({ redirectTo: "/login" })
}
