"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { menuCategorySchema } from "@/app/schemas/menuCategory" // Create this schema
import { FileSelectUpload } from "@/components/custom/file-select-upload"
import { Button } from "@/components/ui/button"
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
import type { MenuCategoryFormValues } from "@/app/schemas/menuCategory" // Create this type

export function MenuCategoryForm({ vendorId }: { vendorId: string }) {
  const toast = useToast()

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
    onSuccess: () => {
      toast.success("Menu category created successfully!")
      form.reset()
    },
    onError: error => {
      toast.error(`Failed to create menu category: ${error.message}`)
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <FileSelectUpload
                  endpoint="imageUploader"
                  onFileSelect={file => {
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
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Is Active</FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                />
              </FormControl>
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
