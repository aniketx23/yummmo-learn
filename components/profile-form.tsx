"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[+]?[\d\s-]{10,15}$/.test(v.replace(/\s/g, "")),
      "Enter a valid phone number (10-15 digits)"
    ),
  avatar_url: z.string().optional(),
});

export function ProfileForm({
  initial,
}: {
  initial: { full_name: string; phone: string; avatar_url: string };
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initial.full_name,
      phone: initial.phone,
      avatar_url: initial.avatar_url,
    },
  });

  const avatarUrl = form.watch("avatar_url");
  const initials = (form.watch("full_name") || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function uploadAvatar(file: File) {
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }
    const path = `avatars/${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(path);
    form.setValue("avatar_url", data.publicUrl);
    toast.success("Photo uploaded");
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        phone: values.phone || null,
        avatar_url: values.avatar_url || null,
      })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved!");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              {uploading ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadAvatar(f);
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              JPG, PNG up to 2 MB
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormDescription>Optional — for WhatsApp updates</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
