import { redirect } from "next/navigation"
import { AiChatInterface } from "@/components/custom/ai-chat-interface"
import { api } from "@/trpc/server"

export default async function AiChatPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full">
      <AiChatInterface />
    </div>
  )
}
