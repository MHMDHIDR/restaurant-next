import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2, IconTrash } from "@tabler/icons-react"
import { CircleHelp } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { menuItemSchema } from "@/app/schemas/menuItem"
import { FileUpload } from "@/components/custom/file-upload"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { MenuItemFormValues } from "@/app/schemas/menuItem"
import type { MenuCategories, MenuItems } from "@/server/db/schema"

interface MenuItemEditProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItem: MenuItems
  menuCategories: MenuCategories[]
}

export function MenuItemEdit({ open, onOpenChange, menuItem, menuCategories }: MenuItemEditProps) {
  const toast = useToast()
  const router = useRouter()
  const [files, setFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)
  const utils = api.useUtils()

  const optimizeImageMutation = api.optimizeImage.optimizeImage.useMutation()
  const uploadFilesMutation = api.S3.uploadFiles.useMutation()

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: menuItem.categoryId,
      name: menuItem.name,
      description: menuItem.description,
      price: parseFloat(menuItem.price),
      image: menuItem.image,
      isAvailable: menuItem.isAvailable ?? false,
      preparationTime: menuItem.preparationTime,
      allergens: menuItem.allergens ?? [],
      nutritionalInfo: {
        calories: menuItem.nutritionalInfo?.calories ?? 0,
        protein: menuItem.nutritionalInfo?.protein ?? 0,
        carbs: menuItem.nutritionalInfo?.carbs ?? 0,
        fat: menuItem.nutritionalInfo?.fat ?? 0,
      },
      addons: (menuItem.addons ?? []).map(addon => ({
        toppingName: addon.toppingName,
        toppingPrice: addon.toppingPrice,
      })),
    },
  })

  const {
    fields: addonFields,
    append: appendAddon,
    remove: removeAddon,
  } = useFieldArray({
    control: form.control,
    name: "addons",
  })

  const handleFilesSelected = (selectedFiles: Array<File>) => {
    setFiles(selectedFiles)
  }

  const optimizeAndUploadImage = async (file: File) => {
    if (!file) return null

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // Optimize image
    const optimizedBase64 = await optimizeImageMutation.mutateAsync({
      base64,
      quality: 70,
    })

    // Extract just the vendor ID and menu item ID from the existing path
    const pathParts = menuItem.image.split("/")
    const vendorId = pathParts[pathParts.indexOf("menu-items") + 1]

    // Prepare file data for S3 upload with a clean path
    const fileData = [
      {
        name: file.name.replace(/\.[^.]+$/, ".webp"),
        type: "image/webp",
        size: optimizedBase64.length,
        lastModified: file.lastModified,
        base64: optimizedBase64,
      },
    ]

    // Upload to S3
    const uploadedUrls = await uploadFilesMutation.mutateAsync({
      entityId: `menu-items/${vendorId}`,
      fileData,
    })

    return uploadedUrls[0]
  }

  const updateMenuItemMutation = api.menuItem.updateMenuItem.useMutation({
    onSuccess: async () => {
      toast.success("Menu item updated successfully!")
      await utils.menuItem.getMenuItems.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => {
      toast.error(`Failed to update menu item: ${error.message}`)
    },
  })

  const onSubmit = async (data: MenuItemFormValues) => {
    setIsUploading(true)
    try {
      let imageUrl = data.image

      // If there's a new image, upload it
      if (files.length > 0 && files[0]) {
        const uploadedUrl = await optimizeAndUploadImage(files[0])
        if (!uploadedUrl) {
          toast.error("Failed to upload image")
          return
        }
        imageUrl = uploadedUrl
      }

      // Convert string values to numbers where needed
      const formattedData = {
        id: menuItem.id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        image: imageUrl,
        isAvailable: data.isAvailable,
        preparationTime: data.preparationTime,
        allergens: data.allergens,
        nutritionalInfo: data.nutritionalInfo,
        addons: data.addons,
      }

      await updateMenuItemMutation.mutateAsync(formattedData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuCategories ? (
                        menuCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={""}>No category available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Item Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center select-none gap-x-6">
                      <Image
                        src={files.length > 0 ? URL.createObjectURL(files[0]!) : menuItem.image}
                        alt="Item Image"
                        width={112}
                        height={112}
                        className="object-cover w-28 h-28 rounded-md shadow"
                      />
                      <FileUpload onFilesSelected={handleFilesSelected} disabled={isUploading} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preparationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="isAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isAvailable" className="flex items-center gap-x-3">
                      <span>Is Available</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleHelp className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" className="text-sm bg-primary">
                          If unchecked, customers won&apos;t be able to order this item.
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Addons/Toppings</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendAddon({ toppingName: "", toppingPrice: 0 })}
                >
                  Add Topping
                </Button>
              </div>
              {addonFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name={`addons.${index}.toppingName`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Topping name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addons.${index}.toppingPrice`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive"
                    onClick={() => removeAddon(index)}
                  >
                    <IconTrash className="h-4 w-4" />
                    <span className="sr-only">Remove topping</span>
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nutritionalInfo.calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutritionalInfo.protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutritionalInfo.carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutritionalInfo.fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={updateMenuItemMutation.isPending || isUploading}
            >
              {updateMenuItemMutation.isPending || isUploading ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Menu Item"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
