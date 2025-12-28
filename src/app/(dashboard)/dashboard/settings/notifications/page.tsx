"use client"

import { useState, useEffect } from "react"
import { Loader2, Bell, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    detectionComplete: true,
    certificateVerified: true,
    usageAlerts: true,
    weeklyDigest: false,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          setSettings({
            emailNotifications: data.emailNotifications ?? true,
            marketingEmails: data.marketingEmails ?? false,
            detectionComplete: true,
            certificateVerified: true,
            usageAlerts: true,
            weeklyDigest: false,
          })
        }
      } catch (error) {
        console.error("Failed to fetch notification settings", error)
      }
    }
    fetchSettings()
  }, [])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast.success("Notification settings updated")
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what emails you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Product updates and promotional offers
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyDigest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Summary of your activity and statistics
              </p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={settings.weeklyDigest}
              onCheckedChange={() => handleToggle("weeklyDigest")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Activity Notifications
          </CardTitle>
          <CardDescription>
            Get notified about activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="detectionComplete">Detection Complete</Label>
              <p className="text-sm text-muted-foreground">
                When a content detection finishes
              </p>
            </div>
            <Switch
              id="detectionComplete"
              checked={settings.detectionComplete}
              onCheckedChange={() => handleToggle("detectionComplete")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="certificateVerified">Certificate Verified</Label>
              <p className="text-sm text-muted-foreground">
                When someone verifies your certificate
              </p>
            </div>
            <Switch
              id="certificateVerified"
              checked={settings.certificateVerified}
              onCheckedChange={() => handleToggle("certificateVerified")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="usageAlerts">Usage Alerts</Label>
              <p className="text-sm text-muted-foreground">
                When approaching or reaching plan limits
              </p>
            </div>
            <Switch
              id="usageAlerts"
              checked={settings.usageAlerts}
              onCheckedChange={() => handleToggle("usageAlerts")}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  )
}

