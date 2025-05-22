"use client"

import { Check, Copy } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function CopyText({ text, className }: { text: string; className?: string }) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
    } catch (error) {
      console.error(error)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Copy
          onClick={() => handleCopyToClipboard(text)}
          className={cn(
            "cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100",
            isCopied && "scale-0",
            className,
          )}
        />
        {isCopied && (
          <Check
            className={cn(
              "absolute top-0 left-0 size-6 text-white",
              "animate-in zoom-in-50 duration-200",
              "rounded-full bg-green-600",
              "animate-[pulse_1s_ease-in-out]",
            )}
          />
        )}
      </div>
    </div>
  )
}
