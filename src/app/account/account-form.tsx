"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { accountFormSchema } from "@/app/schemas/account"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { fallbackUsername } from "@/lib/fallback-username"
import { UploadButton } from "@/lib/uploadthing"
import { api } from "@/trpc/react"
import type { AccountFormValues } from "@/app/schemas/account"
import type { Session } from "next-auth"

export function AccountForm({ user }: { user: Session["user"] }) {
  const [isEditing, setIsEditing] = useState(false)
  const toast = useToast()
  const { setTheme } = useTheme()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      theme: user.theme ?? "light",
      image: user.image ?? "",
    },
  })

  const updateUserMutation = api.users.update.useMutation({
    onSuccess: data => {
      if (data) {
        const updatedValues = {
          id: user.id,
          name: data.name ?? user.name ?? "",
          email: user.email ?? "",
          phone: data.phone ?? "",
          image: data.image ?? "",
          theme: data.theme ?? form.getValues("theme"),
        }

        form.reset(updatedValues)
        setTheme(updatedValues.theme ?? user.theme)

        toast.success("Profile updated successfully!")
        setIsEditing(false)
      }
    },
    onError: error => {
      toast.error(`Failed to update profile: ${error.message}`)
    },
    onMutate: () => {
      toast.loading("Updating profile...")
    },
  })

  // Handle form submission
  const onSubmit = async (data: AccountFormValues) => {
    updateUserMutation.mutate({
      id: user.id,
      name: data.name,
      phone: data.phone,
      theme: data.theme,
      image: data.image,
    })
  }

  // Upload handlers
  const handleUploadComplete = (res: Array<{ url: string }>) => {
    if (res?.[0]) {
      const imageUrl = res[0].url

      form.setValue("image", imageUrl)

      updateUserMutation.mutate({ id: user.id, image: imageUrl })

      toast.success("Upload Completed")
    }
  }
  const handleUploadError = (error: Error) => {
    toast.error(`ERROR! ${error.message}`)
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
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div className="flex items-center select-none gap-x-6">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={`Profile Image of ${user.name}`}
                      width={112}
                      height={112}
                      placeholder={"blur"}
                      blurDataURL={user.blurImageDataURL ?? "/logo.svg"}
                      className="object-contain w-20 h-20 rounded-full shadow"
                    />
                  ) : (
                    <Avatar className="w-20 h-20 rounded-full shadow text-primary">
                      <AvatarFallback className="text-2xl font-bold">
                        {fallbackUsername(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={handleUploadComplete}
                    input={{ objectType: "vendor", objectId: user.id }}
                    onUploadError={handleUploadError}
                    disabled={!isEditing}
                  />
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
              <FormLabel>What&apos;s your full name?</FormLabel>
              <FormControl>
                <Input {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="disabled:cursor-not-allowed disabled:bg-black/50 dark:disabled:bg-white/20"
                  disabled
                />
              </FormControl>
              <FormDescription>
                To change your email address, please contact customer support.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel className="text-left">Phone Number</FormLabel>
              <FormControl className="relative w-full">
                <PhoneInput placeholder="Your Phone Number" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel className="capitalize">{field.value} Mode</FormLabel>
              <FormControl className="relative">
                <Switch
                  checked={field.value === "dark"}
                  onCheckedChange={checked => {
                    const theme = checked ? "dark" : "light"
                    form.setValue("theme", theme)
                  }}
                  disabled={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing ? (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="space-x-4">
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <IconLoader2 className="w-5 h-5 stroke-current animate-spin stroke-1" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
