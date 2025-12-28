"use client"

import { useEffect, useState } from "react"
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  usageCount: number
  lastUsedAt: string | null
  isActive: boolean
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSecretDialog, setShowSecretDialog] = useState(false)

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/api-keys")
      const data = await response.json()
      setKeys(data.keys || [])
    } catch (error) {
      toast.error("Failed to load API keys")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create API key")
      }

      setNewKeySecret(data.key)
      setShowCreateDialog(false)
      setShowSecretDialog(true)
      setNewKeyName("")
      fetchKeys()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete API key")
      }

      toast.success("API key deleted")
      fetchKeys()
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access to Veri
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="Production Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name to identify this key
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Secret Dialog */}
      <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure to copy your API key now. It won't be shown again.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <Input
                value={newKeySecret || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newKeySecret || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSecretDialog(false)
              setNewKeySecret(null)
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keys List */}
      {keys.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No API keys"
          description="Create an API key to access Veri programmatically"
          action={{
            label: "Create Key",
            onClick: () => setShowCreateDialog(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.name}</p>
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-0.5 rounded">
                          {key.keyPrefix}...
                        </code>
                        <span>{key.usageCount.toLocaleString()} requests</span>
                        {key.lastUsedAt && (
                          <span>Last used {formatDateTime(key.lastUsedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* API Documentation Link */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the Veri API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The Veri API allows you to integrate content detection and certification 
            into your own applications.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Example Request:</p>
            <pre className="text-xs overflow-auto">
{`curl -X POST https://veri.app/api/v1/detect \\
  -H "X-API-Key: veri_your_api_key" \\
  -F "file=@image.jpg"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

