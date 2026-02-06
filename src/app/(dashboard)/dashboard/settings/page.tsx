"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only").optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
          reset({
            name: data.name || "",
            username: data.username || "",
            bio: data.bio || "",
            website: data.website || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
      }
    }
    fetchUser()
  }, [reset])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to update profile")
      }

      await update({ name: data.name })
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm" disabled>
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Avatar changes coming soon
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">@</span>
                <Input
                  id="username"
                  placeholder="username"
                  {...register("username")}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={3}
                {...register("bio")}
                disabled={isLoading}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                {...register("website")}
                disabled={isLoading}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <DeleteAccountSection />
    </div>
  )
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to delete account")
      }

      toast.success("Account deleted successfully")
      signOut({ callbackUrl: "/" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmText("") }}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone. All your data — including
                detections, certificates, API keys, and billing information — will be
                permanently removed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-muted-foreground mt-2">
          Permanently delete your account and all associated data.
        </p>
      </CardContent>
    </Card>
  )
}

