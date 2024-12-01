import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput id="search" placeholder="Search the docs..." className="pl-8" />
          <Search className="absolute opacity-50 pointer-events-none select-none left-2 top-1/2 size-4 -translate-y-1/2" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
