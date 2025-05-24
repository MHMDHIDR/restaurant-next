import { IconLogout2 } from "@tabler/icons-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type SignoutButtonProps = { setIsAccountNavOpen: (open: boolean) => void }

export function SignoutButton({ setIsAccountNavOpen }: SignoutButtonProps) {
  const router = useRouter()

  const handleSignoutClick = async () => {
    setIsAccountNavOpen(false)
    await signOut({ redirect: false })
    router.replace("/signin") // using replace to avoid adding signout to history
  }

  return (
    <Button onClick={handleSignoutClick} className="cursor-pointer">
      <IconLogout2 className="size-5 mx-1" />
      <span>Signout</span>
    </Button>
  )
}
