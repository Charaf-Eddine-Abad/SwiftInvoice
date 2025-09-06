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

// Send invoice reminder email
export async function sendInvoiceReminderEmail(
  clientEmail: string, 
  invoice: any, 
  reminderDay: number
): Promise<void> {
  const isOverdue = reminderDay > 0
  const subject = isOverdue 
    ? `SwiftInvoice - Overdue Invoice Reminder (${reminderDay} days overdue)`
    : 'SwiftInvoice - Invoice Due Today'

  const statusText = isOverdue 
    ? `${reminderDay} days overdue`
    : 'due today'

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: clientEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SwiftInvoice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Invoicing</p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">
            ${isOverdue ? 'Overdue Invoice Reminder' : 'Invoice Due Today'}
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            Hello ${invoice.client.name},
          </p>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            This is a friendly reminder that your invoice <strong>#${invoice.invoiceNumber}</strong> 
            is ${statusText}. The total amount due is <strong>$${Number(invoice.totalAmount).toFixed(2)}</strong>.
          </p>
          
          <div style="background-color: white; border: 2px solid ${isOverdue ? '#dc2626' : '#2563eb'}; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Invoice Details</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Invoice Number:</span>
              <span style="color: #1f2937; font-weight: 500;">#${invoice.invoiceNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Issue Date:</span>
              <span style="color: #1f2937; font-weight: 500;">${new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Due Date:</span>
              <span style="color: #1f2937; font-weight: 500;">${new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Status:</span>
              <span style="color: ${isOverdue ? '#dc2626' : '#2563eb'}; font-weight: 500;">${statusText.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
              <span style="color: #1f2937; font-weight: 600; font-size: 16px;">Total Amount:</span>
              <span style="color: #1f2937; font-weight: 600; font-size: 16px;">$${Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/i/${invoice.publicId}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              View Invoice
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            If you have any questions about this invoice, please don't hesitate to contact us.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for your business!
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
