"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"

const inviteStaffSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type InviteStaffFormValues = z.infer<typeof inviteStaffSchema>

type InviteStaffFormProps = {
  vendorId: string
}

export function InviteStaffForm({ vendorId }: InviteStaffFormProps) {
  const toast = useToast()

  const form = useForm<InviteStaffFormValues>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: { email: "" },
  })

  const { mutate: inviteStaff, isPending } = api.vendorAdmin.inviteStaff.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully!")
      form.reset()
    },
    onError: error => {
      toast.error(`Failed to send invitation: ${error.message}`)
    },
  })

  const onSubmit = (data: InviteStaffFormValues) => {
    inviteStaff({ email: data.email, vendorId })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the email address of the person you want to invite"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Invitation...
            </>
          ) : (
            "Send Invitation"
          )}
        </Button>
      </form>
    </Form>
  )
}
