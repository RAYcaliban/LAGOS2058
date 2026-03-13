import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FixedWidthContainer className="py-16 flex items-center justify-center min-h-[70vh]">
      {children}
    </FixedWidthContainer>
  )
}
