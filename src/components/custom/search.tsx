"use client"

import { IconMapPin, IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export function SearchBar() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center max-w-xl p-1 pl-2 mx-auto bg-gray-100 rounded-full"
    >
      <IconMapPin className="mr-2 text-gray-500" />
      <input
        type="text"
        placeholder={
          isMobile
            ? "Search for restaurants, and more..."
            : "Search for dishes, restaurants, cuisines, and more..."
        }
        className={clsx("flex-grow outline-0 bg-transparent", {
          "text-sm": isMobile,
          "text-lg": !isMobile,
        })}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <button
        type="submit"
        className="flex items-center px-2.5 py-1.5 text-white rounded-full bg-primary hover:bg-primary-dark transition-colors"
      >
        <IconSearch className="mr-1" size={20} />
        <span className="hidden sm:inline-flex">Search</span>
      </button>
    </form>
  )
}
