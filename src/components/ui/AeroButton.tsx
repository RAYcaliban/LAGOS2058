'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'aero-button',
  danger: 'aero-button-danger',
  ghost: 'aero-button-ghost',
}

interface AeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  loading?: boolean
}

export function AeroButton({
  variant = 'primary',
  children,
  loading,
  disabled,
  className = '',
  ...props
}: AeroButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
