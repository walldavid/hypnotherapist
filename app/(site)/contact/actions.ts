'use server'

import { sendContactEmail } from '@/lib/email'

interface ContactState {
  success: boolean
  error: string | null
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (message.length < 10) {
    return { success: false, error: 'Message must be at least 10 characters.' }
  }

  try {
    await sendContactEmail({ name, email, message })
    return { success: true, error: null }
  } catch (err) {
    console.error('Contact form error:', err)
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
