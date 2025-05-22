import { IconLoader2 } from "@tabler/icons-react"
import { CircleHelp } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { MenuCategoryFormValues } from "@/app/schemas/menuCategory"
import type { MenuCategories } from "@/server/db/schema"

type CategoryEditProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: MenuCategories
}

export function CategoryEdit({ open, onOpenChange, category }: CategoryEditProps) {
  const toast = useToast()
  const router = useRouter()
  const [files, setFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)
  const utils = api.useUtils()

  const optimizeImageMutation = api.optimizeImage.optimizeImage.useMutation()
  const uploadFilesMutation = api.S3.uploadFiles.useMutation()

  const form = useForm({
    defaultValues: {
      name: category.name,
      description: category.description ?? "",
      image: category.image ?? "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    },
  })

  // Reset form values when category changes
  useEffect(() => {
    form.reset({
      name: category.name,
      description: category.description ?? "",
      image: category.image ?? "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    })
    setFiles([])
  }, [category, form])

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

    // Prepare file data for S3 upload with the same path structure
    const fileData = [
      {
        name: file.name.replace(/\.[^.]+$/, ".webp"),
        type: "image/webp",
        size: optimizedBase64.length,
        lastModified: file.lastModified,
        base64: optimizedBase64,
      },
    ]

    // Upload to S3 using the same path structure
    const uploadedUrls = await uploadFilesMutation.mutateAsync({
      entityId: `menu-category/${category.vendorId}`,
      fileData,
    })

    return uploadedUrls[0]
  }

  const updateCategoryMutation = api.menuCategory.updateCategory.useMutation({
    onSuccess: async () => {
      toast.success("Category updated successfully!")
      await utils.menuCategory.getCategoriesByVendorId.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => {
      toast.error(`Failed to update category: ${error.message}`)
    },
  })

  const onSubmit = async (data: MenuCategoryFormValues) => {
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

      const formattedData = {
        ...data,
        image: imageUrl,
        id: category.id,
      }

      await updateCategoryMutation.mutateAsync(formattedData)
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
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
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
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center select-none gap-x-6">
                      {(category.image ?? files.length > 0) && (
                        <Image
                          src={files.length > 0 ? URL.createObjectURL(files[0]!) : category.image!}
                          alt="Category Image"
                          width={112}
                          height={112}
                          className="object-cover w-28 h-28 rounded-md shadow-sm"
                        />
                      )}
                      <FileUpload onFilesSelected={handleFilesSelected} disabled={isUploading} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isActive" className="flex items-center gap-x-3">
                      <span>Is Active</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleHelp className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center" className="text-sm bg-primary">
                          If unchecked, the category will not be displayed, and you cannot add items
                          to it.
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
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

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={updateCategoryMutation.isPending || isUploading}
            >
              {updateCategoryMutation.isPending || isUploading ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Category"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
