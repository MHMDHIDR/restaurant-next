import clsx from "clsx"
import { Bell, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useOptimistic, useState, useTransition } from "react"
import useSound from "use-sound"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/format-date"
import { api } from "@/trpc/react"
import type { Notifications } from "@/server/db/schema"

type OptimisticAction = { type: "markAsRead"; id: string } | { type: "markAllAsRead" }

export default function Notifications() {
  const { data: session } = useSession()
  const [favicon, setFavicon] = useState<"/logo.svg" | "/logo-notification.svg">("/logo.svg")
  const [play] = useSound("/notification.mp3")
  const [isPending, startTransition] = useTransition()

  const { data: notifications, refetch } = api.notification.getAll.useQuery(undefined, {
    enabled: !!session?.user,
  })

  const markAsRead = api.notification.markAsRead.useMutation({
    onError: error => {
      console.error("Failed to mark notification as read:", error)
    },
  })

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onError: error => {
      console.error("Failed to mark all notifications as read:", error)
    },
  })

  const [optimisticNotifications, addOptimisticNotification] = useOptimistic(
    notifications ?? [],
    (state: Notifications[], action: OptimisticAction) => {
      if (action.type === "markAsRead") {
        return state.map(notification =>
          notification.id === action.id ? { ...notification, isRead: true } : notification,
        )
      } else if (action.type === "markAllAsRead") {
        return state.map(notification => ({ ...notification, isRead: true }))
      }
      return state
    },
  )

  const unreadCount = optimisticNotifications.filter(n => !n.isRead).length ?? 0

  useEffect(() => {
    if (unreadCount > 0) {
      setFavicon("/logo-notification.svg")
      play()
      document.title = `(${unreadCount}) | Restaurant App`
    } else {
      setFavicon("/logo.svg")
      document.title = "Restaurant App"
    }

    const link = document.querySelector("link[type='image/svg+xml']")
    if (link) {
      link.setAttribute("href", favicon)
    }
  }, [unreadCount, favicon, play])

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      addOptimisticNotification({ type: "markAsRead", id: notificationId })
      markAsRead.mutate({ id: notificationId })
      await refetch()
    })
  }

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      addOptimisticNotification({ type: "markAllAsRead" })
      markAllAsRead.mutate()
      await refetch()
    })
  }

  const NotificationContent = ({ notification }: { notification: Notifications }) => {
    if (!notification.isRead) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={clsx(
                  `grid grid-cols-[2.5rem_1fr] items-center p-2 bg-primary/5 hover:bg-transparent cursor-pointer group`,
                  {
                    "opacity-50": isPending,
                  },
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <span className="flex translate-y-1.5 bg-blue-500 h-7 w-7 border-[0.5px] border-blue-500/30 bg-blue-500/15 rounded-full p-1 group-hover:border-blue-500/70" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
                  <p className="text-gray-400 dark:text-gray-500">
                    {formatDate(new Date(notification.createdAt).toISOString(), false, true)}
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="center"
              className="text-sm bg-primary dark:bg-primary/50"
            >
              Mark as read
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <div className="grid grid-cols-[2.5rem_1fr] items-center p-2">
        <Check className="h-7 w-7 text-green-500 border-[0.5px] border-green-500/30 bg-green-500/15 rounded-full p-1" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
          <p className="text-gray-400 dark:text-gray-500">
            {formatDate(new Date(notification.createdAt).toISOString(), false, true)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-auto p-0">
        <div className="grid divide-y-2 text-xs">
          {optimisticNotifications.map(notification => (
            <NotificationContent key={notification.id} notification={notification} />
          ))}
          {optimisticNotifications.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          )}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="m-2"
              disabled={isPending}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
