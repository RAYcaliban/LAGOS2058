import { WikiHeader } from '@/components/wiki/WikiHeader'

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wiki-layout min-h-screen">
      <WikiHeader />
      <div className="wiki-body">{children}</div>
    </div>
  )
}
