"use client";

import { Button } from "@/components/ui/button";
import { IconLogout2 } from "@tabler/icons-react";
import { handleLogout } from "./actions/handle-logout";

export function LogOutButton() {
  return (
    <Button onClick={handleLogout} className="w-fit cursor-pointer">
      <IconLogout2 className="mx-1 h-5 w-5 text-red-500" />
      <span className="hidden sm:inline-flex">Logout</span>
    </Button>
  );
}
