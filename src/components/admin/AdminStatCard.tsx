'use client'

import Link from 'next/link'

interface AdminStatCardProps {
  label: string
  value: string | number
  subtitle?: string
  linkTo?: string
}

export function AdminStatCard({ label, value, subtitle, linkTo }: AdminStatCardProps) {
  const content = (
    <div className="aero-panel p-4 text-center space-y-1">
      <div className="text-xs uppercase tracking-widest text-text-secondary">{label}</div>
      <div className="text-2xl font-display font-bold text-aero-400">{value}</div>
      {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="block hover:ring-1 hover:ring-aero-700 rounded-lg transition-all">
        {content}
      </Link>
    )
  }

  return content
}
