"use client"

import { Bot, Plus, Send, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { ChatMessages, ChatSessions } from "@/server/db/schema"

export function AiChatInterface() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttemptedInitialSession, setHasAttemptedInitialSession] = useState(false)

  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Get all chat sessions
  const { data: sessions, refetch: refetchSessions } = api.aiChat.getChatSessions.useQuery()

  // Get messages for current session
  const { data: messages, refetch: refetchMessages } = api.aiChat.getChatHistory.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId },
  )

  // Mutations
  const createSession = api.aiChat.createChatSession.useMutation({
    onSuccess: session => {
      setCurrentSessionId(session?.id ?? null)
      refetchSessions()
      // Only show toast for manually created sessions, not the initial one
      if (hasAttemptedInitialSession) {
        toast.success("New chat session created!")
      }
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const sendMessage = api.aiChat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages()
      setMessage("")
      setIsLoading(false)
    },
    onError: error => {
      toast.error(error.message)
      setIsLoading(false)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create initial session if none exist
  useEffect(() => {
    if (
      sessions &&
      sessions.length === 0 &&
      !hasAttemptedInitialSession &&
      !createSession.isPending
    ) {
      setHasAttemptedInitialSession(true)
      createSession.mutate({ title: "Restaurant Insights Chat" })
    } else if (sessions && sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0]?.id ?? null)
    }
  }, [sessions, currentSessionId, hasAttemptedInitialSession, createSession.isPending])

  const handleSendMessage = async () => {
    if (!message.trim() || !currentSessionId || isLoading) return

    setIsLoading(true)
    sendMessage.mutate({
      sessionId: currentSessionId,
      message: message.trim(),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = () => {
    setHasAttemptedInitialSession(true) // Mark that we've attempted initial session
    createSession.mutate({
      title: `Chat from ${session?.user.name} on ${new Date().toLocaleTimeString()}`,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
      {/* Sessions Sidebar */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Chat History</CardTitle>
            <Button size="sm" variant="outline" onClick={handleNewChat}>
              <Plus className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-3">
              {sessions?.map(session => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className="truncate">
                    <div className="font-medium text-xs">{session.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="md:col-span-3 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Restaurant AI Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 min-h-[400px]">
              {messages?.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Welcome to your Restaurant AI Assistant!
                  </p>
                  <p className="text-sm">
                    Ask me anything about your restaurant performance, menu optimization, or
                    business insights.
                  </p>
                  <div className="mt-4 text-xs space-y-1">
                    <p>Try asking:</p>
                    <p>"How is my restaurant performing this month?"</p>
                    <p>"What are my best-selling menu items?"</p>
                    <p>"Give me insights on my recent orders"</p>
                  </div>
                </div>
              )}

              {messages?.map(msg => <ChatMessage key={msg.id} message={msg} />)}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="size-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your restaurant performance..."
              disabled={isLoading || !currentSessionId}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || !currentSessionId}
              size="sm"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ChatMessage({ message }: { message: ChatMessages }) {
  const isUser = message.role === "user"

  return (
    <div className="flex gap-3">
      <div
        className={`size-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-blue-500" : "bg-primary"
        }`}
      >
        {isUser ? (
          <User className="size-4 text-white" />
        ) : (
          <Bot className="size-4 text-primary-foreground" />
        )}
      </div>
      <div className="flex-1">
        <div
          className={`rounded-lg p-3 ${isUser ? "bg-blue-50 dark:text-background border" : "bg-muted"}`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {message.tokensUsed && (
            <p className="text-xs text-muted-foreground mt-2">Tokens used: {message.tokensUsed}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
