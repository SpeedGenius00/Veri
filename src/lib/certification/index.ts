import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

export interface CertificatePayload {
  certificateId: string
  contentHash: string
  contentType: string
  contentSize: number
  creatorId: string
  creatorName: string
  title: string
  certifiedAt: string
}

export interface SignedCertificate extends CertificatePayload {
  signature: string
  publicKey: string
  algorithm: string
}

// Generate a unique certificate ID
export function generateCertificateId(): string {
  const uuid = uuidv4().replace(/-/g, "")
  return `veri_${uuid.slice(0, 24)}`
}

// Hash content
export function hashContent(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

// Generate RSA key pair (for new users or system)
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  })

  return { publicKey, privateKey }
}

// Get or create system keys (stored in env for simplicity)
export function getSystemKeys(): { publicKey: string; privateKey: string } {
  // In production, these should be stored securely (HSM, Vault, etc.)
  // For development, we generate them if not present
  
  if (process.env.VERI_PRIVATE_KEY && process.env.VERI_PUBLIC_KEY) {
    return {
      publicKey: process.env.VERI_PUBLIC_KEY.replace(/\\n/g, "\n"),
      privateKey: process.env.VERI_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }
  }

  // Generate new keys for development
  console.warn("⚠️  No signing keys found. Generating temporary keys...")
  const keys = generateKeyPair()
  console.log("Add these to your .env file:")
  console.log(`VERI_PUBLIC_KEY="${keys.publicKey.replace(/\n/g, "\\n")}"`)
  console.log(`VERI_PRIVATE_KEY="${keys.privateKey.replace(/\n/g, "\\n")}"`)
  
  return keys
}

// Create and sign a certificate
export function createCertificate(params: {
  contentHash: string
  contentType: string
  contentSize: number
  creatorId: string
  creatorName: string
  title: string
}): SignedCertificate {
  const { privateKey, publicKey } = getSystemKeys()
  
  const certificateId = generateCertificateId()
  const certifiedAt = new Date().toISOString()

  const payload: CertificatePayload = {
    certificateId,
    contentHash: params.contentHash,
    contentType: params.contentType,
    contentSize: params.contentSize,
    creatorId: params.creatorId,
    creatorName: params.creatorName,
    title: params.title,
    certifiedAt,
  }

  // Create signature
  const dataToSign = JSON.stringify(payload)
  const sign = crypto.createSign("RSA-SHA256")
  sign.update(dataToSign)
  sign.end()
  const signature = sign.sign(privateKey, "base64")

  return {
    ...payload,
    signature,
    publicKey,
    algorithm: "RSA-SHA256",
  }
}

// Verify a certificate signature
export function verifyCertificate(certificate: {
  certificateId: string
  contentHash: string
  contentType: string
  contentSize: number
  creatorId: string
  creatorName: string
  title: string
  certifiedAt: string
  signature: string
  publicKey: string
}): { isValid: boolean; error?: string } {
  try {
    const payload: CertificatePayload = {
      certificateId: certificate.certificateId,
      contentHash: certificate.contentHash,
      contentType: certificate.contentType,
      contentSize: certificate.contentSize,
      creatorId: certificate.creatorId,
      creatorName: certificate.creatorName,
      title: certificate.title,
      certifiedAt: certificate.certifiedAt,
    }

    const dataToVerify = JSON.stringify(payload)
    const verify = crypto.createVerify("RSA-SHA256")
    verify.update(dataToVerify)
    verify.end()

    const isValid = verify.verify(
      certificate.publicKey,
      certificate.signature,
      "base64"
    )

    return { isValid }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Verification failed" 
    }
  }
}

// Verify content hash matches certificate
export function verifyContentHash(
  contentBuffer: Buffer,
  expectedHash: string
): boolean {
  const actualHash = hashContent(contentBuffer)
  return actualHash === expectedHash
}

