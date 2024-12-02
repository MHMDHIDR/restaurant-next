"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { vendorFormSchema } from "@/app/schemas/vendor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import { api } from "@/trpc/react"
import type { VendorFormValues } from "@/app/schemas/vendor"
import type { vendors } from "@/server/db/schema"

const CUISINE_TYPES = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "American",
  "Mediterranean",
  "Middle Eastern",
  "French",
  "Vietnamese",
  "Korean",
  "Spanish",
  "Greek",
  "Other",
]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
    .toString()
    .padStart(2, "0")
  const minute = i % 2 === 0 ? "00" : "30"
  return `${hour}:${minute}`
})

export function VendorApplicationForm({
  vendor,
}: {
  vendor: typeof vendors.$inferSelect | undefined
}) {
  const router = useRouter()
  const toast = useToast()

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      ...vendor,
      name: vendor?.name ?? "",
      logo: vendor?.logo ?? "",
      email: vendor?.email ?? "",
      latitude: Number(vendor?.latitude ?? 0),
      longitude: Number(vendor?.longitude ?? 0),
      address: vendor?.address ?? "",
      minimumOrder: Number(vendor?.minimumOrder ?? 0),
      deliveryRadius: Number(vendor?.deliveryRadius ?? 0),
    },
  })

  const createVendorMutation = api.vendor.create.useMutation({
    onSuccess: () => {
      toast.success("Your application has been submitted successfully! We will contact you soon.")
      router.push("/account")
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to submit application: ${error.message}`)
    },
  })

  const onSubmit = (data: VendorFormValues) => {
    createVendorMutation.mutate(data)
  }

  const handleUploadComplete = (res: Array<{ url: string }>, field: "logo" | "coverImage") => {
    if (res?.[0]) {
      const imageUrl = res[0].url
      form.setValue(field, imageUrl)
      toast.success("Upload Completed")
    }
  }

  const handleUploadError = (error: Error) => {
    toast.error(`ERROR! ${error.message}`)
  }

  const isPending = vendor?.status === "PENDING"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-x-6">
                    {field.value && (
                      <Image
                        src={field.value}
                        alt="Logo"
                        width={112}
                        height={112}
                        className="object-contain w-28 h-28 rounded-lg shadow"
                      />
                    )}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={res => handleUploadComplete(res, "logo")}
                      onUploadError={handleUploadError}
                      disabled={isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-x-6">
                    {field.value && (
                      <Image
                        src={field.value}
                        alt="Cover"
                        width={224}
                        height={112}
                        className="object-cover w-56 h-28 rounded-lg shadow"
                      />
                    )}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={res => handleUploadComplete(res, "coverImage")}
                      onUploadError={handleUploadError}
                      disabled={isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
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
                <Textarea {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Phone</FormLabel>
                <FormControl>
                  <PhoneInput {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-8 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cuisineTypes"
          render={() => (
            <FormItem>
              <FormLabel>Cuisine Types</FormLabel>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {CUISINE_TYPES.map(cuisine => (
                  <FormField
                    key={cuisine}
                    control={form.control}
                    name="cuisineTypes"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(cuisine)}
                            onCheckedChange={(checked: boolean) => {
                              const newValue = checked
                                ? [...(field.value ?? []), cuisine]
                                : field.value?.filter(value => value !== cuisine)
                              field.onChange(newValue)
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{cuisine}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="deliveryRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Radius (km)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Amount (£)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="openingHours"
          render={() => (
            <FormItem>
              <FormLabel>Opening Hours</FormLabel>
              <div className="space-y-4">
                <Checkbox
                  onCheckedChange={
                    // when clicked, set the opening hours for the rest of the week as the same as the first day
                    checked => {
                      if (checked) {
                        const firstDay = DAYS_OF_WEEK[0]
                        const firstDayOpeningHours =
                          form.getValues("openingHours")[firstDay as string]
                        DAYS_OF_WEEK.slice(1).forEach(day => {
                          const openingHours = firstDayOpeningHours || {
                            open: "09:00",
                            close: "17:00",
                          } // Default values
                          form.setValue(`openingHours.${day}`, openingHours)
                        })
                      }
                    }
                  }
                  disabled={isPending}
                >
                  Set the same opening hours for the rest of the week as the first day
                </Checkbox>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`openingHours.${day}.open`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Opening Time - {day}
                          </FormLabel>
                          <Select
                            value={timeField.value}
                            onValueChange={timeField.onChange}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select opening time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
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
                      name={`openingHours.${day}.close`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Closing Time - {day}
                          </FormLabel>
                          <Select
                            value={timeField.value}
                            onValueChange={timeField.onChange}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select closing time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <FormDescription>
                Set your restaurant&apos;s opening hours for each day of the week
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isPending || createVendorMutation.isPending}
        >
          {createVendorMutation.isPending && <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Application
        </Button>
      </form>
    </Form>
  )
}
