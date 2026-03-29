import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}): Promise<void> {
  await resend.emails.send({
    from: 'noreply@hypnotherapy.ie',
    to: process.env.CONTACT_EMAIL_TO || 'hello@hypnotherapy.ie',
    subject: `New contact form message from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
    replyTo: email,
  })
}

export async function sendPurchaseConfirmation({
  customerEmail,
  productTitle,
  downloadUrl,
}: {
  customerEmail: string
  productTitle: string
  downloadUrl: string
}): Promise<void> {
  await resend.emails.send({
    from: 'noreply@hypnotherapy.ie',
    to: customerEmail,
    subject: `Your download is ready — ${productTitle}`,
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>Your self-hypnosis audio <strong>${productTitle}</strong> is ready to download.</p>
      <p>
        <a href="${downloadUrl}" style="background:#7B5EA7;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
          Download Your Audio
        </a>
      </p>
      <p style="color:#666;font-size:14px;">This link expires in 24 hours and can only be used once.</p>
    `,
  })
}
