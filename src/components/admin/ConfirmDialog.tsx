'use client'

import { AeroButton } from '@/components/ui/AeroButton'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="aero-panel p-6 relative z-10 w-full max-w-md mx-4">
        <h3 className="font-display text-lg font-bold text-aero-400 mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <AeroButton variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </AeroButton>
          <AeroButton variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AeroButton>
        </div>
      </div>
    </div>
  )
}
