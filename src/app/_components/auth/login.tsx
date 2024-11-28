"use client"

import { IconBrandGoogle, IconLoader, IconMail } from "@tabler/icons-react"
import clsx from "clsx"
import { signIn } from "next-auth/react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import Divider from "@/components/ui/divider"
import { Input } from "@/components/ui/input"
import { handleSignin } from "./actions/handle-signin"

export default function Login() {
  const [state, handleSigninAction, isPending] = useActionState(handleSignin, {
    message: undefined,
    success: true,
  })

  return (
    <div className="space-y-4">
      <Button
        onClick={() => signIn("google")}
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        <IconBrandGoogle className="mx-1 inline-block h-6 w-6" />
        Sign in with Google
      </Button>

      <Divider className="my-10" />

      <form action={handleSigninAction} className="space-y-3">
        {!state.success && <span className="text-red-700">{state.message}</span>}
        {state.success && <span className="text-green-700">{state.message}</span>}
        <Input type="email" name="email" placeholder="Email" />
        <Button
          type="submit"
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
      </form>
    </div>
  )
}
