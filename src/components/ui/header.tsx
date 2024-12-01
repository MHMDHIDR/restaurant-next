import { Search } from "lucide-react"
import MobileNav from "@/components/custom/mobile-nav"
import { Input } from "./input"

export default function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <MobileNav />
      <div className="flex-1 w-full">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 shadow-none appearance-none bg-background md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
