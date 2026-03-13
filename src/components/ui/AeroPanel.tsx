import { type ReactNode } from 'react'

type PanelVariant = 'glass' | 'flat' | 'parchment'

const VARIANT_CLASS: Record<PanelVariant, string> = {
  glass: 'aero-panel',
  flat: 'aero-panel-flat',
  parchment: 'aero-panel-parchment',
}

interface AeroPanelProps {
  variant?: PanelVariant
  children: ReactNode
  className?: string
  padding?: string
}

export function AeroPanel({
  variant = 'glass',
  children,
  className = '',
  padding = 'p-5',
}: AeroPanelProps) {
  return (
    <div className={`${VARIANT_CLASS[variant]} ${padding} ${className}`}>
      {children}
    </div>
  )
}
