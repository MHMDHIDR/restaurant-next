"use client";

import { IconLogout2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { handleSignout } from "./actions/handle-signout";

export function LogOutButton() {
  return (
    <Button onClick={handleSignout} className="w-fit cursor-pointer">
      <IconLogout2 className="mx-1 h-5 w-5 text-red-500" />
      <span className="hidden sm:inline-flex">Signout</span>
    </Button>
  );
}
