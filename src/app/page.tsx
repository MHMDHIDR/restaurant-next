import { ChevronRight, Sparkles, StoreIcon, TrendingUp, UtensilsCrossed } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CategoriesGrid } from "@/components/custom/categories"
import { RestaurantCard } from "@/components/custom/restaurant-card"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { SearchBar } from "@/components/custom/search"
import { Badge } from "@/components/ui/badge"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { api } from "@/trpc/server"
import type { RouterOutputs } from "@/trpc/react"

type VendorWithMenuItems = RouterOutputs["vendor"]["getFeatured"]["items"][number] & {
  menuItems: RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"]
  menuItemsCount: number
}

type MenuItem = RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"][number]

export const dynamic = "force-dynamic"

export default async function Home() {
  const { items: vendors } = await api.vendor.getFeatured({
    status: "ACTIVE",
    limit: 3,
    cursor: 0,
  })
  const { menuCategories: activeCategories } = await api.menuCategory.getAllCategories({
    hasItems: true,
  })

  const vendorsWithMenus: VendorWithMenuItems[] = await Promise.all(
    vendors.map(async vendor => {
      const menuItems = await api.menuItem.getMenuItemsByVendorId({
        vendorId: vendor.id,
        addedById: vendor.addedById,
      })
      return { ...vendor, menuItems: menuItems.items, menuItemsCount: menuItems.count }
    }),
  )

  const heroImagePath = "/hero-bg.webp"
  const blurHeroImage = await getBlurPlaceholder(heroImagePath, 300, 90)

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full min-h-[560px] md:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0">
          <Image
            src={heroImagePath}
            alt="Delicious food spread"
            width={1920}
            height={640}
            className="absolute inset-0 object-cover w-full h-full scale-105 animate-[pulse_20s_ease-in-out_infinite]"
            blurDataURL={blurHeroImage ?? heroImagePath}
            placeholder="blur"
            priority
            style={{
              animation: "20s ease-in-out infinite alternate",
              animationName: "hero-zoom",
            }}
          />
        </div>

        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="absolute inset-0 hero-gradient-warm" />

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 food-bubble animate-float-slow opacity-40 hidden md:block" />
        <div className="absolute top-40 right-20 w-12 h-12 food-bubble animate-float-medium opacity-30 hidden md:block" />
        <div className="absolute bottom-32 left-1/4 w-16 h-16 food-bubble animate-float-slow opacity-35 hidden md:block" />
        <div className="absolute bottom-48 right-1/3 w-10 h-10 food-bubble animate-float-medium opacity-25 hidden md:block" />

        {/* Hero Content */}
        <div className="container relative z-10 px-4 mx-auto text-center">
          {/* Animated Badge */}
          <div className="animate-reveal-up mb-6">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/90 text-white border-none shadow-lg backdrop-blur-sm">
              <Sparkles className="size-4 mr-2 animate-pulse" />
              Fresh & Delicious Food Awaits
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="animate-reveal-up-delay-1 mt-4 mb-6 text-3xl md:text-4xl lg:text-6xl xl:text-7xl select-none max-md:text-balance font-extrabold text-white leading-tight tracking-tight">
            <span className="block">Discover Delicious</span>
            <span className="inline-block mt-2 animate-gradient-text bg-clip-text">
              Restaurants & Takeaways
            </span>
            <span className="block mt-2 text-white/90">Near You</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-reveal-up-delay-2 max-w-2xl mx-auto mb-10 text-lg md:text-xl text-white/80 font-light">
            From local favorites to gourmet cuisine, find your next delicious meal with just a few
            clicks
          </p>

          {/* Enhanced Search Bar */}
          <div className="animate-reveal-up-delay-3">
            <SearchBar />
          </div>

          {/* Quick Stats */}
          <div className="animate-reveal-up-delay-3 flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <UtensilsCrossed className="size-4 text-primary" />
              <span>
                <strong className="text-white">{vendors.length}+</strong> Restaurants
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <TrendingUp className="size-4 text-green-400" />
              <span>
                <strong className="text-white">{activeCategories.length}+</strong> Categories
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container px-4 py-16 mx-auto max-w-(--breakpoint-xl)">
        {/* ===== FEATURED RESTAURANTS SECTION ===== */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-reveal-up">
              <h2 className="text-2xl md:text-3xl font-bold section-title-premium">
                Featured Restaurants
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Hand-picked restaurants with the best reviews and quality food
              </p>
            </div>
            <Link
              href="/r"
              className="hidden md:flex items-center gap-1 text-primary hover:text-primary-dark transition-colors font-medium group"
            >
              View all
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendorsWithMenus.map((vendor, index) => (
              <div key={vendor.id} className={`animate-reveal-up stagger-${index + 1}`}>
                <RestaurantCard vendor={vendor} />
              </div>
            ))}
          </div>
        </section>

        {/* ===== POPULAR CATEGORIES SECTION ===== */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-reveal-up">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold section-title-premium">
                  Popular Categories
                </h2>
                <Link href="/c">
                  <Badge className="animate-pulse-glow bg-linear-to-r from-primary to-orange-400 border-none text-white hover:scale-105 transition-transform">
                    view all
                  </Badge>
                </Link>
              </div>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Explore cuisines from around the world
              </p>
            </div>
          </div>

          <CategoriesGrid categories={activeCategories} limit={6} />
        </section>

        {/* ===== POPULAR MENU ITEMS SECTION ===== */}
        {vendorsWithMenus.some(vendor => vendor.menuItemsCount > 0) && (
          <section className="mb-16">
            <div className="animate-reveal-up mb-8">
              <h2 className="text-2xl md:text-3xl font-bold section-title-premium">
                Popular Menu Items
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Most loved dishes from our partner restaurants
              </p>
            </div>

            <div className="space-y-12">
              {vendorsWithMenus
                .filter(vendor => vendor.menuItemsCount > 0)
                .map(vendor => (
                  <div key={vendor.id} className="animate-reveal-up">
                    {/* Restaurant Header */}
                    <Link href={`/r/${vendor.slug}`} className="group">
                      <div className="mb-6 flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-primary/10 via-orange-50/50 to-transparent dark:from-primary/20 dark:via-orange-900/10 dark:to-transparent w-fit hover:from-primary/20 transition-all duration-300">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <StoreIcon className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {vendor.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {vendor.menuItemsCount} items available
                          </p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-2" />
                      </div>
                    </Link>

                    {/* Menu Items Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {vendor.menuItems.map((item: MenuItem, itemIndex) => (
                        <div key={item.id} className={`animate-reveal-up stagger-${itemIndex + 1}`}>
                          <RestaurantMenuItem
                            item={item}
                            vendor={{ id: vendor.id, name: vendor.name }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ===== CTA SECTION ===== */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-orange-500 to-amber-500 p-8 md:p-12 mb-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Hungry? Order Now!</h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of food lovers already enjoying delicious meals from the best local
              restaurants
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/c"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-primary font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <UtensilsCrossed className="size-5 mr-2" />
                Browse Menu
              </Link>
              <Link
                href="/become-a-vendor"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/20 text-white font-bold backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <StoreIcon className="size-5 mr-2" />
                Partner With Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
