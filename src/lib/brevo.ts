interface EmailAttachment {
  name: string
  content: string // base64
}

interface SendEmailOptions {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(options: SendEmailOptions) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_FROM_EMAIL || 'contact@diploma-sante.fr',
        name: process.env.BREVO_FROM_NAME || 'Diploma Santé',
      },
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      attachment: options.attachments,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `Brevo error ${res.status}`)
  }

  return res.json()
}
