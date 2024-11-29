"use client";

import { useRef, useState } from "react";
import type { AccountFormValues } from "@/app/schemas/account";
import { accountFormSchema } from "@/app/schemas/account";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";

export function AccountForm({ user }: { user: Session["user"] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(user);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      fullName: userData.name || "",
      email: userData.email || "",
      image: userData.image || "",
    },
  });

  const updateUserMutation = api.users.update.useMutation({
    onSuccess: (data) => {
      // Type guard to ensure data is not undefined
      if (data) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setUserData((prevUser) => ({
          ...prevUser,
          name: data.name ?? prevUser.name,
          image: data.image ?? prevUser.image,
        }));
      }
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
    onMutate: () => {
      toast.loading("Saving profile...");
    },
  });

  async function onSubmit(data: AccountFormValues) {
    let imageUrl = userData.image as string | undefined;

    // Type-safe file check
    if (data.image && typeof data.image === "object" && "type" in data.image) {
      imageUrl = URL.createObjectURL(data.image as File);
    }

    updateUserMutation.mutate({
      id: user.id,
      name: data.fullName,
      image: imageUrl,
    });
  }

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
                <div className="flex items-center space-x-4">
                  {userData.image && (
                    <Image
                      src={userData.image}
                      alt="Profile"
                      width={112}
                      height={112}
                      className="h-28 w-28 rounded-full object-contain shadow"
                    />
                  )}
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        const imageUrl = res[0].url;
                        // Update form and UI
                        form.setValue("image", imageUrl);
                        setUserData((prev) => ({ ...prev, image: imageUrl }));

                        // Update database
                        updateUserMutation.mutate({
                          id: user.id,
                          image: imageUrl,
                        });

                        toast.success("Upload Completed");
                      }
                    }}
                    onUploadError={(error: Error) =>
                      toast.error(`ERROR! ${error.message}`)
                    }
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
          name="fullName"
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
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                To change your email address, please contact customer support.
              </FormDescription>
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
            <Button
              type="submit"
              disabled={updateUserMutation.status === "pending"}
            >
              {updateUserMutation.status === "pending" ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
