"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { vendorFormSchema } from "@/app/schemas/vendor"
import { LoadingCard } from "@/components/custom/data-table/loading"
import { FileUpload } from "@/components/custom/file-upload"
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
  isEditing,
}: {
  vendor: typeof vendors.$inferSelect | null
  isEditing?: boolean
}) {
  const router = useRouter()
  const toast = useToast()
  const searchParams = useSearchParams()

  const [logoFiles, setLogoFiles] = useState<Array<File>>([])
  const [coverFiles, setCoverFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vendorId] = useState(() => vendor?.id ?? crypto.randomUUID())

  const optimizeImageMutation = api.optimizeImage.optimizeImage.useMutation()
  const uploadFilesMutation = api.S3.uploadFiles.useMutation()
  const createStripeAccountMutation = api.vendor.createStripeAccount.useMutation()
  const getStripeAccountLinkMutation = api.vendor.getStripeAccountLink.useMutation()
  const { data: stripeAccountStatus, isLoading: isLoadingStripeAccount } =
    api.vendor.getStripeAccountStatus.useQuery({ vendorId }, { enabled: !!vendor?.stripeAccountId })

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      ...vendor,
      id: vendor?.id,
      name: vendor?.name ?? "",
      logo: vendor?.logo ?? "",
      coverImage: vendor?.coverImage ?? "",
      status: vendor?.status ?? "PENDING",
      email: vendor?.email ?? "",
      latitude: Number(vendor?.latitude ?? 0),
      longitude: Number(vendor?.longitude ?? 0),
      address: vendor?.address ?? "",
      city: vendor?.city ?? "",
      state: vendor?.state ?? "",
      postalCode: vendor?.postalCode ?? "",
      minimumOrder: Number(vendor?.minimumOrder ?? 0),
      deliveryRadius: Number(vendor?.deliveryRadius ?? 0),
      addedById: session?.user?.id ?? "",
      description: vendor?.description ?? "",
      phone: vendor?.phone ?? "",
      openingHours: vendor?.openingHours ?? {
        Monday: { open: "09:00", close: "17:00" },
        Tuesday: { open: "09:00", close: "17:00" },
        Wednesday: { open: "09:00", close: "17:00" },
        Thursday: { open: "09:00", close: "17:00" },
        Friday: { open: "09:00", close: "17:00" },
        Saturday: { open: "09:00", close: "17:00" },
        Sunday: { open: "09:00", close: "17:00" },
      },
      cuisineTypes: vendor?.cuisineTypes ?? [],
    },
  })

  const optimizeAndUploadImage = async (file: File, type: "logo" | "cover") => {
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
      entityId: `vendor-${type}/${vendorId}`,
      fileData,
    })

    return uploadedUrls[0]
  }

  const createVendorMutation = api.vendor.create.useMutation({
    onSuccess: async data => {
      if (!data) return
      toast.success("Vendor application submitted successfully!")
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to submit application: ${error.message}`)
      setIsSubmitting(false)
    },
  })

  const editVendorMutation = api.vendor.update.useMutation({
    onSuccess: () => {
      toast.success("Vendor information updated successfully")
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to update vendor: ${error.message}`)
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: VendorFormValues) => {
    setIsSubmitting(true)
    if (!coverFiles.length && !data.coverImage) {
      toast.error("Cover image is required")
      setIsSubmitting(false)
      return
    }

    setIsUploading(true)
    try {
      let logoUrl = data.logo
      let coverUrl = data.coverImage

      if (logoFiles.length > 0) {
        const uploadedLogoUrl = await optimizeAndUploadImage(logoFiles[0]!, "logo")
        if (uploadedLogoUrl) logoUrl = uploadedLogoUrl
      }

      if (coverFiles.length > 0) {
        const uploadedCoverUrl = await optimizeAndUploadImage(coverFiles[0]!, "cover")
        if (uploadedCoverUrl) coverUrl = uploadedCoverUrl
      }

      const vendorData = {
        ...data,
        id: vendorId,
        latitude: data.latitude || 51.5074,
        longitude: data.longitude || -0.1278,
        logo: logoUrl,
        coverImage: coverUrl,
      }

      if (isEditing) {
        await editVendorMutation.mutateAsync(vendorData)
      } else {
        await createVendorMutation.mutateAsync(vendorData)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  // Handle Stripe Connect setup
  const handleStripeSetup = async () => {
    if (!vendorId) {
      toast.error("Vendor ID is required")
      return
    }

    if (!vendor) {
      toast.error("Please save your vendor details first")
      return
    }

    if (
      !vendor.name ||
      !vendor.email ||
      !vendor.phone ||
      !vendor.address ||
      !vendor.city ||
      !vendor.state ||
      !vendor.postalCode
    ) {
      toast.error("Please complete your business details before setting up Stripe")
      return
    }

    try {
      if (!vendor.stripeAccountId) {
        // Get account link for the new account
        const accountLink = await getStripeAccountLinkMutation.mutateAsync({
          vendorId: vendorId,
        })
        window.location.href = accountLink.url
      } else {
        // Get account link for existing account
        const accountLink = await getStripeAccountLinkMutation.mutateAsync({
          vendorId: vendorId,
        })
        window.location.href = accountLink.url
      }
    } catch (error) {
      console.error("Stripe setup error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to setup Stripe Connect")
    }
  }

  // Handle refresh from Stripe Connect
  useEffect(() => {
    if (searchParams.get("refresh") === "true") {
      router.replace("/vendor-manager/vendor-details")
    }
  }, [searchParams, router])

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
                  <div className="flex flex-col gap-y-4">
                    {(field.value || logoFiles.length > 0) && (
                      <Image
                        src={
                          logoFiles.length > 0 ? URL.createObjectURL(logoFiles[0]!) : field.value
                        }
                        alt="Logo"
                        width={112}
                        height={112}
                        className="object-contain w-28 h-28 rounded-lg shadow-sm"
                      />
                    )}
                    <FileUpload onFilesSelected={setLogoFiles} disabled={isUploading} />
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
                  <div className="flex flex-col gap-y-4">
                    {(field.value || coverFiles.length > 0) && (
                      <Image
                        src={
                          coverFiles.length > 0 ? URL.createObjectURL(coverFiles[0]!) : field.value
                        }
                        alt="Cover"
                        width={224}
                        height={112}
                        className="object-cover w-56 h-28 rounded-lg shadow-sm"
                      />
                    )}
                    <FileUpload onFilesSelected={setCoverFiles} disabled={isUploading} />
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

        <div className="grid gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
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
                  <PhoneInput {...field} />
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
                <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
              <FormLabel htmlFor="sameOpeningHours" className="flex items-center gap-x-2">
                <Checkbox
                  id="sameOpeningHours"
                  onCheckedChange={checked => {
                    if (checked) {
                      const firstDay = DAYS_OF_WEEK[0]
                      const firstDayOpeningHours = form.getValues("openingHours")[firstDay!]
                      DAYS_OF_WEEK.slice(1).forEach(day => {
                        const openingHours = firstDayOpeningHours ?? {
                          open: "09:00",
                          close: "17:00",
                        }
                        form.setValue(`openingHours.${day}`, openingHours)
                      })
                    }
                  }}
                />
                <span>Set the same opening hours for the rest of the week as the first day</span>
              </FormLabel>
              <div className="space-y-4">
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
                          <Select value={timeField.value} onValueChange={timeField.onChange}>
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
                          <Select value={timeField.value} onValueChange={timeField.onChange}>
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

        {isEditing && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">Stripe Connect Status</h3>
              <div className="text-sm text-muted-foreground">
                {!vendor?.stripeAccountId ? (
                  "Setup your Stripe account to receive payments"
                ) : isLoadingStripeAccount ? (
                  <LoadingCard renderedSkeletons={1} className="h-4" />
                ) : stripeAccountStatus?.isEnabled ? (
                  "Your Stripe account is fully setup"
                ) : (
                  "Complete your Stripe account setup"
                )}
              </div>
            </div>
            <Button
              type="button"
              onClick={handleStripeSetup}
              disabled={
                createStripeAccountMutation.isPending || getStripeAccountLinkMutation.isPending
              }
            >
              {createStripeAccountMutation.isPending || getStripeAccountLinkMutation.isPending ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : isLoadingStripeAccount ? (
                <>
                  <Loader2 className="animate-spin h-7 w-7" /> Getting Information
                </>
              ) : !vendor?.stripeAccountId ? (
                "Setup Stripe Account"
              ) : stripeAccountStatus?.isEnabled ? (
                "View Stripe Dashboard"
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : isEditing ? (
            "Update Information"
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  )
}
