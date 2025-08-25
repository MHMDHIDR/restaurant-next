import { redirect } from "next/navigation"
import { AiChatInterface } from "@/components/custom/ai-chat-interface"
import { api } from "@/trpc/server"

export default async function AiChatPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Restaurant Insights</h1>
        <p className="text-muted-foreground">
          Chat with AI to get insights about your restaurant performance, menu optimization, and
          business trends.
        </p>
      </div>

      <AiChatInterface />
    </div>
  )
}
