import { CategoriesGrid } from "@/components/custom/categories"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { api } from "@/trpc/server"

// Helper function to generate pagination items
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is less than or equal to maxVisiblePages
    for (let i = 1; i <= totalPages; i++) {
      items.push(i)
    }
  } else {
    // Always show first page
    items.push(1)

    if (currentPage > 3) {
      items.push("ellipsis-start")
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(i)
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end")
    }

    // Always show last page
    items.push(totalPages)
  }

  return items
}

export default async function CategoriesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const page = searchParams?.page ? Number(searchParams.page) : 1
  const limit = searchParams?.limit ? Number(searchParams.limit) : ITEMS_PER_PAGE

  const { menuCategories: activeCategories, pagination: paginationInfo } =
    await api.menuCategory.getAllCategories({ hasItems: true, searchParams: { page, limit } })

  return (
    <div className="container px-2 py-12 mx-auto max-w-screen-lg">
      <h1 className="mb-8 text-3xl font-bold text-center">All Categories</h1>
      <CategoriesGrid categories={activeCategories} columns={2} />

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <div className="mt-10">
          <Pagination>
            <PaginationContent>
              {/* Previous button */}
              <PaginationItem>
                <PaginationPrevious
                  href={
                    paginationInfo.hasPreviousPage
                      ? `/c?page=${paginationInfo.previousPage}&limit=${paginationInfo.pageSize}`
                      : undefined
                  }
                  aria-disabled={!paginationInfo.hasPreviousPage}
                  disabled={!paginationInfo.hasPreviousPage}
                />
              </PaginationItem>

              {/* Page numbers */}
              {generatePaginationItems(paginationInfo.currentPage, paginationInfo.totalPages).map(
                (item, index) => (
                  <PaginationItem key={`${item}-${index}`}>
                    {item === "ellipsis-start" || item === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={`/c?page=${item}&limit=${paginationInfo.pageSize}`}
                        isActive={item === paginationInfo.currentPage}
                        aria-disabled={item === paginationInfo.currentPage}
                        disabled={item === paginationInfo.currentPage}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ),
              )}

              {/* Next button */}
              <PaginationItem>
                <PaginationNext
                  href={
                    paginationInfo.hasNextPage
                      ? `/c?page=${paginationInfo.nextPage}&limit=${paginationInfo.pageSize}`
                      : undefined
                  }
                  aria-disabled={!paginationInfo.hasNextPage}
                  disabled={!paginationInfo.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
