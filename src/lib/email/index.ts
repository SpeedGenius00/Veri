import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || "Veri <noreply@veri.app>"

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error("Email send error:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Veri</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Welcome to Veri!</h1>
        </div>
        
        <p>Hi ${name},</p>
        
        <p>Thanks for joining Veri! You now have access to:</p>
        
        <ul>
          <li><strong>AI Detection</strong> - Check if content is AI-generated</li>
          <li><strong>Certification</strong> - Prove your content is authentic</li>
          <li><strong>Verification</strong> - Let anyone verify your certificates</li>
        </ul>
        
        <p>Get started with 10 free detections every day.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>Questions? Just reply to this email.</p>
        
        <p>Best,<br>The Veri Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Veri - Know What's Real<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #6b7280;">veri.app</a>
        </p>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: "Welcome to Veri! 🎉",
    html,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Reset Your Password</h1>
        </div>
        
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>This link expires in 1 hour.</p>
        
        <p>If you didn't request this, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Veri - Know What's Real
        </p>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: "Reset your Veri password",
    html,
  })
}

export async function sendCertificateCreatedEmail(
  to: string,
  certificateTitle: string,
  certificateUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Certificate Created</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0;">✓ Certificate Created</h1>
        </div>
        
        <p>Your certificate for <strong>"${certificateTitle}"</strong> has been created.</p>
        
        <p>Anyone can now verify your content is authentic using the verification link.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${certificateUrl}" 
             style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Certificate
          </a>
        </div>
        
        <p>Share the verification link with anyone who needs to verify your content.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Veri - Know What's Real
        </p>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Certificate created: ${certificateTitle}`,
    html,
  })
}

export async function sendUsageLimitWarningEmail(
  to: string,
  limitType: string,
  currentUsage: number,
  limit: number
) {
  const percentage = Math.round((currentUsage / limit) * 100)
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Usage Limit Warning</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; margin: 0;">⚠️ Usage Limit Warning</h1>
        </div>
        
        <p>You've used <strong>${percentage}%</strong> of your ${limitType}.</p>
        
        <p>Current usage: ${currentUsage} / ${limit}</p>
        
        <p>To continue using Veri without interruption, consider upgrading your plan.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade Plan
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Veri - Know What's Real
        </p>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `You're approaching your ${limitType} limit`,
    html,
  })
}

