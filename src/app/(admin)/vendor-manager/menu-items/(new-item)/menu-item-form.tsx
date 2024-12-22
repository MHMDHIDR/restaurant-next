"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { CircleHelp } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { FileUpload } from "@/components/custom/file-upload"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { MenuCategories } from "@/server/db/schema"

const menuItemSchema = z.object({
  categoryId: z.string().nonempty("Category is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  price: z.string().nonempty("Price is required"),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z
    .object({
      calories: z.string().optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    })
    .optional(),
  addons: z
    .array(
      z.object({
        toppingName: z.string(),
        toppingPrice: z.string(),
      }),
    )
    .optional(),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  vendorId: string
  categories: MenuCategories[]
}

export function MenuItemForm({ vendorId, categories }: MenuItemFormProps) {
  const toast = useToast()
  const [files, setFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)

  const optimizeImageMutation = api.optimizeImage.optimizeImage.useMutation()
  const uploadFilesMutation = api.S3.uploadFiles.useMutation()

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      price: "",
      image: "",
      isAvailable: true,
      preparationTime: "",
      allergens: [],
      nutritionalInfo: {
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      },
      addons: [],
    },
  })

  const { fields: addonFields, append: appendAddon } = useFieldArray({
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

    // Prepare file data for S3 upload
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

  const createMenuItemMutation = api.menuItem.createMenuItem.useMutation({
    onSuccess: () => {
      toast.success("Menu item created successfully!")
      form.reset()
      setFiles([])
    },
    onError: error => {
      toast.error(`Failed to create menu item: ${error.message}`)
    },
  })

  const onSubmit = async (data: MenuItemFormValues) => {
    setIsUploading(true)
    try {
      // Check for image first
      if (!files.length || !files[0]) {
        toast.error("Please select an image")
        return
      }

      // Upload and optimize image first
      const uploadedUrl = await optimizeAndUploadImage(files[0])
      if (!uploadedUrl) {
        toast.error("Failed to upload image")
        return
      }

      // Convert string values to numbers where needed
      const formattedData = {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description ?? "",
        price: parseFloat(data.price),
        image: uploadedUrl,
        isAvailable: data.isAvailable,
        preparationTime: parseInt(data.preparationTime ?? "0"),
        allergens: data.allergens ?? [],
        nutritionalInfo: {
          calories: parseInt(data.nutritionalInfo?.calories ?? "0"),
          protein: parseInt(data.nutritionalInfo?.protein ?? "0"),
          carbs: parseInt(data.nutritionalInfo?.carbs ?? "0"),
          fat: parseInt(data.nutritionalInfo?.fat ?? "0"),
        },
        addons: data.addons?.map(addon => ({
          toppingName: addon.toppingName,
          toppingPrice: parseFloat(addon.toppingPrice),
        })),
      }

      await createMenuItemMutation.mutateAsync(formattedData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const currentImage = form.watch("image")

  return (
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
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
                  {currentImage || files.length > 0 ? (
                    <Image
                      src={files.length > 0 ? URL.createObjectURL(files[0]!) : currentImage!}
                      alt="Item Image"
                      width={112}
                      height={112}
                      className="object-cover w-28 h-28 rounded-md shadow"
                    />
                  ) : null}
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
                <Input type="number" step="0.01" {...field} />
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
                <Input type="number" {...field} />
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
                <Checkbox id="isAvailable" checked={field.value} onCheckedChange={field.onChange} />
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
              onClick={() => appendAddon({ toppingName: "", toppingPrice: "" })}
            >
              Add Topping
            </Button>
          </div>
          {addonFields.map((_field, index) => (
            <div key={`addon-${index}`} className="flex gap-4">
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
                      <Input type="number" step="0.01" placeholder="Price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Nutritional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nutritionalInfo.calories"
              key="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.protein"
              key="protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.carbs"
              key="carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.fat"
              key="fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
          disabled={createMenuItemMutation.isPending || isUploading}
        >
          {createMenuItemMutation.isPending || isUploading ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Menu Item"
          )}
        </Button>
      </form>
    </Form>
  )
}
