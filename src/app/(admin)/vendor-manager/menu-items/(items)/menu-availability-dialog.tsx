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
import type { MenuItems } from "@/server/db/schema"

type MenuAvailabilityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItems
  isMultiple?: boolean
  selectedItems?: MenuItems[]
}

export function MenuAvailabilityDialog({
  open,
  onOpenChange,
  menuItem,
  isMultiple = false,
  selectedItems = [],
}: MenuAvailabilityDialogProps) {
  const router = useRouter()
  const utils = api.useUtils()
  const toast = useToast()

  const form = useForm({
    defaultValues: { isAvailable: menuItem.isAvailable },
  })

  const { mutate: updateMenuItem } = api.menuItem.updateMenuItem.useMutation({
    onSuccess: async () => {
      toast.success(
        isMultiple
          ? `${selectedItems.length} items updated successfully`
          : "Item availability updated successfully",
      )
      await utils.menuItem.getAllMenuItems.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => {
      toast.error(`Failed to update availability: ${error.message}`)
    },
  })

  const onSubmit = async (values: { isAvailable: boolean }) => {
    if (isMultiple && selectedItems) {
      for (const item of selectedItems) {
        updateMenuItem({ id: item.id, isAvailable: values.isAvailable })
      }
    } else {
      updateMenuItem({ id: menuItem.id, isAvailable: values.isAvailable })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Availability</DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Change availability for ${selectedItems.length} selected items`
              : `Change availability for ${menuItem.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Availability</FormLabel>
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
                        <FormLabel className="font-normal">Available</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">Unavailable</FormLabel>
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
