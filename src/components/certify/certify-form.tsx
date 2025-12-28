"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Upload, 
  X, 
  Award, 
  Loader2,
  Image,
  FileText,
  File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn, formatBytes } from "@/lib/utils"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  tags: z.string().optional(),
  isPublic: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface CertifyFormProps {
  onSuccess: (result: any) => void
}

export function CertifyForm({ onSuccess }: CertifyFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPublic: true,
    },
  })

  const isPublic = watch("isPublic")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    disabled: isLoading,
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image
    if (file.type.startsWith("text/")) return FileText
    return File
  }

  const clearFile = () => {
    setSelectedFile(null)
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to certify")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      const metadata = {
        title: data.title,
        description: data.description,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        isPublic: data.isPublic,
      }
      formData.append("metadata", JSON.stringify(metadata))

      const response = await fetch("/api/certify", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Certification failed")
      }

      toast.success("Certificate created successfully!")
      onSuccess(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Certification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Content</CardTitle>
          <CardDescription>
            Upload the original file you want to certify
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getFileIcon(selectedFile)
                    return <Icon className="h-10 w-10 text-primary" />
                  })()}
                  <div>
                    <p className="font-medium truncate max-w-[250px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                {isDragActive ? "Drop your file here" : "Drag & drop your file"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports images, videos, audio, and documents up to 50MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>
            Add information about your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="My Original Artwork"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your content..."
              rows={3}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="art, digital, original (comma separated)"
              {...register("tags")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas (max 10)
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="isPublic">Public Certificate</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone to view and verify this certificate
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue("isPublic", checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={isLoading || !selectedFile}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Certificate...
          </>
        ) : (
          <>
            <Award className="h-4 w-4" />
            Create Certificate
          </>
        )}
      </Button>
    </form>
  )
}

