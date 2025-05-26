"use client"

import { IconChefHat, IconMapPin, IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardContentLink } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { APP_LOGO } from "@/lib/constants"
import { api } from "@/trpc/react"
import EmptyState from "./empty-state"

type SearchBarProps = {
  maxSuggestions?: number
}

type SearchSuggestion = {
  id: string
  name: string
  slug: string
  vendorSlug?: string
  image: string
  imageBlur: string | null
  type: "vendor" | "menuItem" | "category"
}

/**  helper function to map suggestion type */
function getSuggestionType(type: SearchSuggestion["type"]): string {
  switch (type) {
    case "vendor":
      return "Restaurant"
    case "menuItem":
      return "Menu Item"
    case "category":
      return "Category"
    default:
      return "Suggestion"
  }
}

export function SearchBar({ maxSuggestions = 10 }: SearchBarProps) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const utils = api.useUtils()

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoadingSuggestions(true)

    const fetchSuggestions = async () => {
      try {
        const { vendors, categories, menuItems } = await utils.search.search.fetch({
          query: searchQuery,
          limit: maxSuggestions,
        })

        const suggestionList = [
          ...vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.name,
            slug: vendor.slug,
            image: vendor.logo,
            imageBlur: vendor.blurLogo,
            type: "vendor" as const,
          })),
          ...menuItems.map(menuItem => ({
            id: menuItem.id,
            name: menuItem.name,
            slug: menuItem.slug,
            vendorSlug: menuItem.vendor.slug,
            image: menuItem.image,
            imageBlur: menuItem.blurImage,
            type: "menuItem" as const,
          })),
          ...categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image ?? APP_LOGO,
            imageBlur: category.blurLogo,
            type: "category" as const,
          })),
        ].slice(0, maxSuggestions) satisfies SearchSuggestion[]

        setSuggestions(suggestionList)
      } catch (err) {
        console.error("Suggestion error", err)
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(() => {
      void fetchSuggestions()
    }, 1500)

    return () => clearTimeout(debounce)
  }, [searchQuery, maxSuggestions, utils.search.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="relative max-w-xl mx-auto">
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
          className={clsx("grow outline-0 bg-transparent", {
            "text-sm": isMobile,
            "text-lg": !isMobile,
          })}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="flex cursor-pointer items-center px-2.5 py-1.5 text-white rounded-full bg-primary hover:bg-primary-dark transition-colors"
        >
          <IconSearch className="mr-1" size={20} />
          <span className="hidden sm:inline-flex">Search</span>
        </button>
      </form>

      {isLoadingSuggestions ? (
        <Card className="absolute z-10 w-full mt-1 border border-gray-200 shadow-md bg-white">
          <CardContent className="p-2 flex justify-center items-center gap-2 md:gap-3 text-sm text-gray-500">
            <IconChefHat className="animate-bounce size-5" />
            <span>Looking for {searchQuery}</span>
          </CardContent>
        </Card>
      ) : suggestions.length > 0 ? (
        <Card className="absolute z-10 w-full mt-1 border border-gray-200 shadow-md bg-white">
          {suggestions.map(suggestion => (
            <CardContentLink
              key={suggestion.id}
              className="px-0"
              href={
                suggestion.type === "vendor"
                  ? `/r/${suggestion.slug}`
                  : suggestion.type === "category"
                    ? `/c/${suggestion.slug}`
                    : `/r/${suggestion.vendorSlug}/item/${suggestion.slug}`
              }
            >
              <div className="inline-flex justify-between items-center min-w-full px-2 py-1.5 gap-2.5 text-sm hover:bg-gray-100 rounded transition text-primary">
                <div className="flex gap-1.5 items-center">
                  <Image
                    src={suggestion.image}
                    blurDataURL={suggestion.imageBlur ?? APP_LOGO}
                    placeholder={suggestion.imageBlur ? "blur" : "empty"}
                    alt={`${suggestion.type} icon`}
                    className="inline-block mr-2 size-4.5 shadow rounded-md"
                    width={18}
                    height={18}
                    loading="eager"
                  />
                  {suggestion.name}
                </div>

                <span className="text-xs text-muted-foreground">
                  ({getSuggestionType(suggestion.type)})
                </span>
              </div>
            </CardContentLink>
          ))}
        </Card>
      ) : (
        !isLoadingSuggestions &&
        searchQuery.trim() &&
        suggestions.length === 0 && (
          <Card className="absolute z-10 w-full mt-1 border border-gray-200 shadow-md bg-white">
            <CardContent className="p-2 text-sm text-gray-500">
              <EmptyState className="text-center text-muted-foreground" isSmall>
                <p className="mt-4 text-sm text-gray-500 select-none dark:text-gray-400">
                  Oof! 😮‍💨 We searched the universe, but couldn&apos;t find anything for &quot;
                  {searchQuery}&quot;.
                </p>
              </EmptyState>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
