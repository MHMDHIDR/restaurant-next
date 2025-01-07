import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { MenuCategories } from "@/server/db/schema"

export function CategoryStatusDialog({
  open,
  onOpenChange,
  category,
  isMultiple,
  selectedItems,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: MenuCategories
  isMultiple?: boolean
  selectedItems?: MenuCategories[]
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const toast = useToast()
  const form = useForm({ defaultValues: { isActive: category.isActive } })

  const { mutate: updateCategory } = api.menuCategory.updateCategory.useMutation({
    onSuccess: async () => {
      toast.success(isMultiple ? `${selectedItems?.length} categories updated` : "Status updated")
      await utils.menuCategory.getCategoriesByVendorId.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => toast.error(error.message),
  })

  const onSubmit = (values: { isActive: boolean }) => {
    if (isMultiple && selectedItems) {
      selectedItems.forEach(item => {
        updateCategory({ id: item.id, isActive: values.isActive })
      })
    } else {
      updateCategory({ id: category.id, isActive: values.isActive })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Change status for ${selectedItems?.length} categories`
              : `Change status for ${category.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={value => field.onChange(value === "true")}
                      value={field.value?.toString()}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">Inactive</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
