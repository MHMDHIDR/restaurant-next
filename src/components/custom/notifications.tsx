import { Bell, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSound from "use-sound"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/format-date"
import { api } from "@/trpc/react"

export default function Notifications() {
  const { data: session } = useSession()
  const [favicon, setFavicon] = useState<"/logo.svg" | "/logo-notification.svg">("/logo.svg")
  const [play] = useSound("/notification.mp3")

  const { data: notifications, refetch } = api.notification.getAll.useQuery(undefined, {
    enabled: !!session?.user,
  })

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0

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
        <div className="grid divide-y-2">
          {notifications?.map(notification => (
            <div
              key={notification.id}
              className="grid grid-cols-[25px_1fr] items-start p-2"
              onClick={() => markAsRead.mutate({ id: notification.id })}
            >
              {!notification.isRead ? (
                <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-gray-500">{notification.message}</p>
                <p className="text-sm text-gray-400 dark:text-gray-400">
                  {formatDate(new Date(notification.createdAt).toISOString(), false, true)}
                </p>
              </div>
            </div>
          ))}
          {notifications?.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" className="m-2" onClick={() => markAllAsRead.mutate()}>
              Mark All as Read
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
