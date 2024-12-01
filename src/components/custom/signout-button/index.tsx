"use client"

import { IconLogout2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { handleSignout } from "./actions/handle-signout"

export function SignoutButton() {
  return (
    <Button onClick={handleSignout} className="cursor-pointer">
      <IconLogout2 className="w-5 h-5 mx-1" />
      <span>Signout</span>
    </Button>
  )
}
