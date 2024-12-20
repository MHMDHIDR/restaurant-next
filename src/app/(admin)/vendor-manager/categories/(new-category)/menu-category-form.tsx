"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { CircleHelp } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { menuCategorySchema } from "@/app/schemas/menuCategory"
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
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { MenuCategoryFormValues } from "@/app/schemas/menuCategory"

export function MenuCategoryForm({ vendorId }: { vendorId: string }) {
  const toast = useToast()
  const [files, setFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)

  const optimizeImageMutation = api.optimizeImage.optimizeImage.useMutation()
  const uploadFilesMutation = api.S3.uploadFiles.useMutation()

  const handleFilesSelected = (selectedFiles: Array<File>) => {
    setFiles(selectedFiles)
  }

  const form = useForm<MenuCategoryFormValues>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: {
      vendorId,
      name: "",
      description: "",
      image: "",
      isActive: true,
      sortOrder: 0,
    },
  })

  const createMenuCategoryMutation = api.menuCategory.createWithImage.useMutation({
    onSuccess: () => {
      toast.success("Menu category created successfully!")
      form.reset()
      setFiles([])
    },
    onError: error => {
      toast.error(`Failed to create menu category: ${error.message}`)
    },
  })

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
      entityId: `menu-category/${vendorId}`,
      fileData,
    })

    return uploadedUrls[0]
  }

  const onSubmit = async (data: MenuCategoryFormValues) => {
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

      await createMenuCategoryMutation.mutateAsync({
        ...data,
        image: uploadedUrl,
      })
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
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <div className="flex items-center select-none gap-x-6">
                  {currentImage || files.length > 0 ? (
                    <Image
                      src={files.length > 0 ? URL.createObjectURL(files[0]!) : currentImage!}
                      alt="Category Image"
                      width={112}
                      height={112}
                      className="object-contain w-28 h-28 rounded-md shadow"
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-x-2 space-y-0">
              <FormControl>
                <Checkbox id="isActive" checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="isActive" className="flex items-center gap-x-3">
                  <span>Is Active</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" className="text-sm bg-primary">
                      If unchecked, the category will not be displayed, and you cannot add items to
                      it.
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
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={createMenuCategoryMutation.isPending || isUploading}
        >
          {createMenuCategoryMutation.isPending || isUploading ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Menu Category"
          )}
        </Button>
      </form>
    </Form>
  )
}
