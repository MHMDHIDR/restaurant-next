import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function LoadingCard({
  className,
  renderedSkeletons = 4,
  layout = "vertical",
}: {
  className?: string
  /**
   *  Number of loading skeletons to render
   */
  renderedSkeletons?: number
  layout?: "horizontal" | "vertical"
}) {
  return (
    <div className={cn(`flex gap-2.5`, layout === "vertical" ? "flex-col" : "flex-row")}>
      {renderedSkeletons ? (
        Array.from({ length: renderedSkeletons }).map((_, index) => (
          <Skeleton key={index} className={cn(`h-12 w-full`, className)} />
        ))
      ) : (
        <Skeleton className={cn(`h-12 w-full`, className)} />
      )}
    </div>
  )
}
