import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <main className="flex flex-col flex-1 p-4 gap-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
      </div>
      <div
        className="flex items-center justify-center flex-1 border border-dashed rounded-lg shadow-sm py-3"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center text-center gap-1">
          <h3 className="text-2xl font-bold tracking-tight">You have no products</h3>
          <p className="text-sm text-muted-foreground">
            You can start selling as soon as you add a product.
          </p>
          <Button className="mt-4">Add Product</Button>
        </div>
      </div>
    </main>
  )
}
