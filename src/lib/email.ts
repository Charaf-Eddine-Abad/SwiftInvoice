import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'SwiftInvoice - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SwiftInvoice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Invoicing</p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up with SwiftInvoice! To complete your registration, please verify your email address using the code below:
          </p>
          
          <div style="background-color: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Verification Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 SwiftInvoice. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'SwiftInvoice - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SwiftInvoice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Invoicing</p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password for your SwiftInvoice account. Use the code below to reset your password:
          </p>
          
          <div style="background-color: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Reset Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 SwiftInvoice. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
