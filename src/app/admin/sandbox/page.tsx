'use client'

import { AeroPanel } from '@/components/ui/AeroPanel'
import { ActionSandbox } from '@/components/admin/ActionSandbox'

export default function AdminSandboxPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Action Sandbox</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <p className="text-sm text-text-secondary mb-4">
          Fabricate any action for any party and preview the engine&apos;s response instantly.
          No database writes — results are discarded after viewing.
        </p>
        <ActionSandbox />
      </AeroPanel>
    </div>
  )
}
