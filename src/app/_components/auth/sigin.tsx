"use client"

import { IconBrandGoogle, IconLoader, IconMail } from "@tabler/icons-react"
import clsx from "clsx"
import { signIn } from "next-auth/react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import Divider from "@/components/ui/divider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { handleSignin } from "./actions/handle-signin"

export default function Sigin() {
  const [state, handleSigninAction, isPending] = useActionState(handleSignin, {
    message: undefined,
    success: true,
  })

  return (
    <Card className="min-w-96">
      <CardHeader>
        <CardDescription>Sigin to continue to the Restaurant App</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => signIn("google")}
          className="w-full bg-blue-500 text-white hover:bg-blue-600"
        >
          <IconBrandGoogle className="mx-1 inline-block h-6 w-6" />
          Sign in with Google
        </Button>

        <Divider className="my-10" />

        <form action={handleSigninAction} className="space-y-3">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              {!state.success && <span className="text-red-700">{state.message}</span>}
              {state.success && <span className="text-green-700">{state.message}</span>}
              <Input type="email" name="email" id="email" placeholder="Email" />
              <Button
                className={clsx("w-full bg-gray-200 text-black hover:bg-gray-300", {
                  "pointer-events-none cursor-not-allowed": isPending,
                })}
                disabled={isPending}
              >
                {isPending ? (
                  <IconLoader className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <IconMail className="mx-1 inline-block h-6 w-6" />
                )}
                Sign in with Email
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
