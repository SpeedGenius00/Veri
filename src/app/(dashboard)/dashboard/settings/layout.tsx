"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Lock, Bell, CreditCard, Key } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsNav = [
  { label: "Profile", href: "/dashboard/settings", icon: User },
  { label: "Security", href: "/dashboard/settings/security", icon: Lock },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="md:w-56 space-y-1">
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

