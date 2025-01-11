"use client"

import { IconMapPin, IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SearchBar() {
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
        placeholder="Search for restaurants, dishes, or cuisines"
        className="flex-grow text-lg text-black bg-transparent outline-none"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <button
        type="submit"
        className="flex items-center px-4 py-2 text-white rounded-full bg-primary"
      >
        <IconSearch className="mr-2" size={20} />
        Search
      </button>
    </form>
  )
}
