import { AiChatInterface } from "@/components/custom/ai-chat-interface"

export default async function AdminAiChatPage() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Platform Insights</h1>
        <p className="text-muted-foreground">
          Chat with AI to get insights about all restaurants on the platform, compare performance,
          and identify opportunities.
        </p>
      </div>

      <AiChatInterface />
    </div>
  )
}
