"use client"

import {
  IconBowlChopsticks,
  IconBuildingStore,
  IconCategory,
  IconChefHat,
  IconSearch,
} from "@tabler/icons-react"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardContentLink } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { APP_LOGO } from "@/lib/constants"
import { unslug } from "@/lib/create-slug"
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
    <div className="relative max-w-xl mx-auto md:mt-20">
      <form
        onSubmit={handleSearch}
        className="flex items-center max-w-xl p-1 pl-2 mx-auto bg-accent/100 rounded-full"
      >
        <input
          type="text"
          placeholder={
            isMobile
              ? "Search for restaurants, and more..."
              : "Search for dishes, restaurants, cuisines, and more..."
          }
          className={clsx("grow px-2.5 py-4 outline-0", {
            "text-sm": isMobile,
            "text-lg": !isMobile,
          })}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="flex cursor-pointer items-center px-3 md:px-4 py-4 rounded-full bg-primary hover:bg-primary-dark transition-colors text-white"
        >
          <IconSearch className="mr-1" size={20} />
          <span className="hidden sm:inline-flex">Search</span>
        </button>
      </form>

      {isLoadingSuggestions ? (
        <Card className="absolute z-10 w-full mt-0.5 border shadow-md overflow-clip">
          <CardContent className="p-2 py-10 flex justify-center items-center gap-2 md:gap-3 text-lg break-words">
            <IconChefHat className="animate-bounce size-6" size={24} />
            <span>Looking for {searchQuery}</span>
          </CardContent>
        </Card>
      ) : suggestions.length > 0 ? (
        <Card className="absolute z-10 w-full mt-0.5 border shadow-md overflow-clip">
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
              <div className="inline-flex justify-between items-center min-w-full px-2 py-1.5 gap-2.5 text-sm hover:bg-accent-foreground/10 rounded transition text-primary">
                <div className="flex gap-1.5 items-center">
                  <Image
                    src={suggestion.image}
                    blurDataURL={suggestion.imageBlur ?? APP_LOGO}
                    placeholder={suggestion.imageBlur ? "blur" : "empty"}
                    alt={`${suggestion.type} icon`}
                    className="inline-block mr-2 size-10 shadow rounded-md object-cover"
                    width={40}
                    height={40}
                    loading="eager"
                  />
                  {unslug(suggestion.name)}
                </div>

                <SearchSuggestionType type={suggestion.type} isMobile={isMobile} />
              </div>
            </CardContentLink>
          ))}
        </Card>
      ) : (
        !isLoadingSuggestions &&
        searchQuery.trim() &&
        suggestions.length === 0 && (
          <Card className="absolute z-10 w-full mt-0.5 shadow-md overflow-clip">
            <CardContent className="p-2 text-sm text-gray-500">
              <EmptyState className="text-center text-muted-foreground flex flex-col gap-6" isSmall>
                <p className="mt-4 text-sm text-gray-500 select-none dark:text-gray-400">
                  Oof! 😮‍💨 We searched the universe, but couldn&apos;t find anything for &quot;
                  {searchQuery}&quot;.
                </p>
                <Link href="/c">
                  <Button>
                    <IconCategory className="size-5" />
                    Maybe try browsing categories?
                  </Button>
                </Link>
              </EmptyState>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

function SearchSuggestionType({
  type,
  isMobile,
}: {
  type: SearchSuggestion["type"]
  isMobile: boolean
}) {
  return (
    <Badge className="text-xs inline-flex gap-x-1 md:gap-x-2 items-center" variant={"secondary"}>
      {type === "vendor" ? (
        <IconBuildingStore size={isMobile ? 14 : 18} />
      ) : type === "menuItem" ? (
        <IconBowlChopsticks size={isMobile ? 14 : 18} />
      ) : type === "category" ? (
        <IconCategory size={isMobile ? 14 : 18} />
      ) : (
        <IconChefHat size={isMobile ? 14 : 18} />
      )}
      {getSuggestionType(type)}
    </Badge>
  )
}
