import QRCode from "qrcode"

export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error("QR code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

