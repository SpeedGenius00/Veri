import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

// Only initialize if AWS credentials are provided
let s3Client: S3Client | null = null

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

const BUCKET = process.env.AWS_S3_BUCKET || "veri-content"
const CDN_URL = process.env.AWS_CLOUDFRONT_URL

// Generate unique file key
function generateFileKey(userId: string, filename: string): string {
  const hash = crypto.randomBytes(16).toString("hex")
  const ext = filename.split(".").pop() || "bin"
  return `uploads/${userId}/${hash}.${ext}`
}

// Upload file to S3
export async function uploadFile(
  buffer: Buffer,
  userId: string,
  filename: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  if (!s3Client) {
    // Fallback for development - return local URL
    const key = generateFileKey(userId, filename)
    return {
      key,
      url: `local://${key}`,
    }
  }

  const key = generateFileKey(userId, filename)

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        userId,
        originalFilename: filename,
        uploadedAt: new Date().toISOString(),
      },
    })
  )

  const url = CDN_URL 
    ? `${CDN_URL}/${key}`
    : `https://${BUCKET}.s3.amazonaws.com/${key}`

  return { key, url }
}

// Get signed URL for private file
export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (!s3Client) {
    return `local://${key}`
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  if (!s3Client) {
    return
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

// Upload thumbnail
export async function uploadThumbnail(
  buffer: Buffer,
  userId: string,
  originalKey: string
): Promise<{ key: string; url: string }> {
  if (!s3Client) {
    const thumbKey = originalKey.replace("uploads/", "thumbnails/").replace(/\.[^.]+$/, ".jpg")
    return {
      key: thumbKey,
      url: `local://${thumbKey}`,
    }
  }

  const thumbKey = originalKey.replace("uploads/", "thumbnails/").replace(/\.[^.]+$/, ".jpg")

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: thumbKey,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  )

  const url = CDN_URL 
    ? `${CDN_URL}/${thumbKey}`
    : `https://${BUCKET}.s3.amazonaws.com/${thumbKey}`

  return { key: thumbKey, url }
}

