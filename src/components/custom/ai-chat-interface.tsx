"use client"

import clsx from "clsx"
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Ellipsis,
  Menu,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { ChartRenderer } from "./charts/chart-renderer"
import { ConfirmationDialog } from "./data-table/confirmation-dialog"
import type { ChatMessages } from "@/server/db/schema"
import type { ChartConfig } from "@/types/chart"

export function AiChatInterface() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null)
  const [newSessionTitle, setNewSessionTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttemptedInitialSession, setHasAttemptedInitialSession] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const defaultChatMessages = [
    "How is my restaurant performing this month?",
    "Show me my revenue for the last month in chart format",
    "What are my best-selling menu items?",
    "Give me my order distribution as a pie chart",
  ]

  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const utils = api.useUtils()

  // Get all chat sessions
  const { data: chatSessions, refetch: refetchSessions } = api.aiChat.getChatSessions.useQuery()

  // Get messages for current session
  const { data: messages, refetch: refetchMessages } = api.aiChat.getChatHistory.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId },
  )

  // Mutations
  const createSession = api.aiChat.createChatSession.useMutation({
    onSuccess: async session => {
      setCurrentSessionId(session?.id ?? null)
      await refetchSessions()
      if (hasAttemptedInitialSession) {
        toast.success("New chat session created!")
      }
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const sendMessage = api.aiChat.sendMessage.useMutation({
    onSuccess: async () => {
      await refetchMessages()
      setMessage("")
      setIsLoading(false)
    },
    onError: error => {
      toast.error(error.message)
      setIsLoading(false)
    },
  })

  const deleteSession = api.aiChat.deleteChatSession.useMutation({
    onSuccess: async () => {
      await refetchSessions()
      setDeleteDialogOpen(false)
      // If we deleted the current session, switch to the first available one
      if (chatSessions && chatSessions.length > 1) {
        const remainingSessions = chatSessions.filter(s => s.id !== renameSessionId)
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0]?.id ?? null)
        }
      } else {
        setCurrentSessionId(null)
      }
    },
    onError: error => {
      toast.error(error.message)
      setDeleteDialogOpen(false)
    },
  })

  const renameSession = api.aiChat.renameChatSession.useMutation({
    onMutate: async ({ sessionId, title }) => {
      // Optimistically update the UI immediately
      const previousSessions = utils.aiChat.getChatSessions.getData()

      utils.aiChat.getChatSessions.setData(undefined, old => {
        if (!old) return old
        return old.map(session => (session.id === sessionId ? { ...session, title } : session))
      })

      return { previousSessions }
    },
    onSuccess: async () => {
      setRenameDialogOpen(false)
      setRenameSessionId(null)
      setNewSessionTitle("")
      toast.success("Chat session renamed successfully!")
    },
    onError: (error, _variables, context) => {
      // Revert to previous state on error
      if (context?.previousSessions) {
        utils.aiChat.getChatSessions.setData(undefined, context.previousSessions)
      }
      toast.error(error.message)
    },
    onSettled: () => {
      // Refetch to ensure we have the latest server state
      void utils.aiChat.getChatSessions.invalidate()
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create initial session if none exist
  useEffect(() => {
    if (chatSessions?.length === 0 && !hasAttemptedInitialSession && !createSession.isPending) {
      setHasAttemptedInitialSession(true)
      createSession.mutate({ title: "Restaurant Insights Chat" })
    } else if (chatSessions && chatSessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(chatSessions[0]?.id ?? null)
    }
  }, [chatSessions, currentSessionId, hasAttemptedInitialSession, createSession])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !currentSessionId || isLoading) return

    setIsLoading(true)
    sendMessage.mutate({
      sessionId: currentSessionId,
      message: messageText.trim(),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage(message)
    }
  }

  const handleNewChat = () => {
    setHasAttemptedInitialSession(true)
    createSession.mutate({
      title: `Chat from ${session?.user.name} on ${new Date().toLocaleTimeString()}`,
    })
  }

  const handleRename = (sessionId: string, currentTitle: string) => {
    setRenameSessionId(sessionId)
    setNewSessionTitle(currentTitle)
    setRenameDialogOpen(true)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameSessionId || !newSessionTitle.trim()) return

    renameSession.mutate({
      sessionId: renameSessionId,
      title: newSessionTitle.trim(),
    })
  }

  return (
    <div className="flex h-screen max-h-[calc(100vh-5.7rem)] bg-background relative">
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setIsSidebarCollapsed(true)
          }}
        />
      )}

      {/* Sessions Sidebar */}
      <div
        className={`
        border-r border-border flex flex-col transition-all duration-300 bg-background z-50
        ${
          isSidebarCollapsed
            ? "w-0 md:w-16 -translate-x-full md:translate-x-0"
            : "w-80 fixed md:relative left-0 top-0 h-full md:h-auto"
        }
      `}
      >
        {/* Sidebar Header with Toggle */}
        <Button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          variant="ghost"
          size="sm"
          className="size-10 p-0 shrink-0 absolute -top-10 left-13"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
        <div className={clsx("flex items-center justify-between", !isSidebarCollapsed && "p-2")}>
          {!isSidebarCollapsed && (
            <Button
              onClick={handleNewChat}
              className="flex-1 justify-start gap-2 mr-2 text-sm h-9"
              variant="outline"
            >
              <Plus className="size-4" />
              <span className="inline">New Chat</span>
            </Button>
          )}
        </div>

        {/* Collapsed state - Show new chat button */}
        {isSidebarCollapsed && (
          <div className="p-2 hidden md:block">
            <Button onClick={handleNewChat} variant="outline" size="sm" className="w-full p-0 h-8">
              <Plus className="size-4" />
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chatSessions?.map(session => (
              <div key={session.id} className="group relative">
                {isSidebarCollapsed ? (
                  // Collapsed view - just a dot
                  <Button
                    variant={currentSessionId === session.id ? "secondary" : "ghost"}
                    className="w-full h-8 p-0 hidden md:flex"
                    onClick={() => setCurrentSessionId(session.id)}
                    title={session.title}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </Button>
                ) : (
                  // Expanded view
                  <>
                    <Button
                      variant={currentSessionId === session.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3 pr-10"
                      onClick={() => {
                        setCurrentSessionId(session.id)
                        // Close sidebar on mobile after selection
                        if (window.innerWidth < 768) {
                          setIsSidebarCollapsed(true)
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="font-medium text-sm truncate max-w-[200px] sm:max-w-[240px]">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Ellipsis className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleRename(session.id, session.title)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="size-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameSessionId(session.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Menu Button - Show when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <Button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setIsSidebarCollapsed(false)
          }}
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-30 md:hidden h-9 w-9 p-0 bg-background border border-border shadow-sm"
        >
          <Menu className="size-4" />
        </Button>
      )}

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-1.5 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
              {messages?.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Bot className="size-12 md:size-16 mx-auto mb-4 md:mb-6 text-muted-foreground/50" />
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">
                    Welcome to your Restaurant AI Assistant!
                  </h3>
                  <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4">
                    Ask me anything about your restaurant performance, menu optimization, or
                    business insights.
                  </p>
                </div>
              ) : (
                <>
                  {messages?.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 md:gap-4">
                      <div className="size-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="size-3 md:size-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-fit">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="md:-ml-3" containerClassName="max-sm:max-w-xs mx-auto">
                  {defaultChatMessages.map((msg, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-3 basis-auto">
                      <Button
                        variant="outline"
                        onClick={() => void handleSendMessage(msg)}
                        className="whitespace-nowrap text-xs md:text-sm h-8 md:h-auto px-3 md:px-4"
                        disabled={isLoading || !currentSessionId}
                      >
                        {msg}
                      </Button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 md:-left-10" />
                <CarouselNext className="right-0 md:-right-10" />
              </Carousel>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-3 md:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 md:gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your restaurant performance..."
                  disabled={isLoading || !currentSessionId}
                  className="min-h-10 md:min-h-12 px-3 md:px-4 py-2 md:py-3 resize-none rounded-xl border-2 focus:border-primary text-sm md:text-base"
                  dir="auto"
                />
              </div>
              <Button
                onClick={() => handleSendMessage(message)}
                disabled={!message.trim() || isLoading || !currentSessionId}
                size="sm"
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl p-0 shrink-0"
              >
                <Send className="size-3 md:size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4 max-w-[calc(100vw-2rem)]">
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Chat</DialogTitle>
              <DialogDescription hidden />
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Chat Title</Label>
                <Input
                  id="title"
                  value={newSessionTitle}
                  onChange={e => setNewSessionTitle(e.target.value)}
                  placeholder="Enter new chat title..."
                  maxLength={100}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!newSessionTitle.trim()} className="w-full sm:w-auto">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Chat Session?"
        description="Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently lost."
        buttonText="Delete"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={() => {
          if (renameSessionId) {
            deleteSession.mutate({ sessionId: renameSessionId })
          }
        }}
      />
    </div>
  )
}

function ChatMessage({ message }: { message: ChatMessages }) {
  const isUser = message.role === "user"
  const messageTime = new Date(message.createdAt).toLocaleString()

  // Parse chart data if available
  let chartConfig: ChartConfig | null = null
  if (message.chartData && !isUser) {
    try {
      chartConfig = JSON.parse(message.chartData) as ChartConfig
    } catch (error) {
      console.error("Failed to parse chart data:", error)
    }
  }

  return (
    <div className="flex gap-1.5 md:gap-2 w-full">
      <div
        className={`size-6 md:size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-500" : "bg-primary"
        }`}
      >
        {isUser ? (
          <User className="size-3 md:size-4 text-white" />
        ) : (
          <Bot className="size-3 md:size-4 text-primary-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0 max-w-full">
        <div
          className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
            isUser
              ? "bg-blue-500 text-white ml-auto max-w-[85%] md:max-w-[75%]"
              : "bg-muted max-w-full"
          }`}
          dir="auto"
        >
          {/* Text content */}
          {message.content && (
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed wrap-break-word word-wrap text-wrap mb-3">
              {message.content}
            </p>
          )}

          {/* Chart content */}
          {chartConfig && !isUser && (
            <div className="mt-3 p-3 bg-background rounded-lg border">
              <ChartRenderer config={chartConfig} />
            </div>
          )}
        </div>
        <p
          className="text-xs text-muted-foreground mt-1 md:mt-2"
          title={messageTime}
          aria-label={messageTime}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
