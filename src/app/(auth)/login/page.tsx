import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-text-secondary">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
