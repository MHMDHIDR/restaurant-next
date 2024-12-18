"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { generateReactHelpers } from "@uploadthing/react"
import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { menuCategorySchema } from "@/app/schemas/menuCategory" // Create this schema
import { FileSelectUpload } from "@/components/custom/file-select-upload"
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import type { MenuCategoryFormValues } from "@/app/schemas/menuCategory"

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

export function MenuCategoryForm({ vendorId }: { vendorId: string }) {
  const toast = useToast()
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const { startUpload } = useUploadThing("imageUploader")

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

  const createMenuCategoryMutation = api.menuCategory.create.useMutation({
    onSuccess: async ({ createdCategory }) => {
      if (categoryImage && createdCategory) {
        try {
          const response = await startUpload([categoryImage])

          if (response && response[0]?.url) {
            await updateMenuCategoryImage.mutateAsync({
              id: createdCategory.id,
              image: response[0].url,
            })
          }
        } catch (error) {
          toast.error(
            `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
          )
          return
        }
      }

      toast.success("Menu category created successfully!")
      form.reset()
      setCategoryImage(null)
    },
    onError: error => {
      toast.error(`Failed to create menu category: ${error.message}`)
    },
  })

  const updateMenuCategoryImage = api.menuCategory.updateImage.useMutation({
    onError: error => {
      toast.error(`Failed to update category image: ${error.message}`)
    },
  })

  const onSubmit = (data: MenuCategoryFormValues) => {
    createMenuCategoryMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              {(field.value ?? categoryImage) && (
                <Image
                  src={field.value ? field.value : URL.createObjectURL(categoryImage!)}
                  alt="Category"
                  width={100}
                  height={100}
                  className="object-contain w-28 h-28 rounded-md shadow"
                />
              )}
              <FormControl>
                <FileSelectUpload
                  endpoint="imageUploader"
                  isSelectButton={true}
                  onFileSelect={file => {
                    setCategoryImage(file)
                    field.onChange(file ? URL.createObjectURL(file) : "")
                  }}
                />
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
                <FormLabel htmlFor="isActive">Is Active</FormLabel>
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
          disabled={createMenuCategoryMutation.isPending}
        >
          <>
            Create Menu Category
            {createMenuCategoryMutation.isPending && (
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
          </>
        </Button>
      </form>
    </Form>
  )
}
