import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) redirect('/studio')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-lilac-pale)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[var(--color-indigo-deep)]">
            Admin Login
          </h1>
          <p className="mt-2 font-body text-sm text-gray-500">
            Sign in to manage your site
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
