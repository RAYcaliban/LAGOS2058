'use client'

import { AeroPanel } from '@/components/ui/AeroPanel'
import { EngineBridge } from '@/components/admin/EngineBridge'

export default function AdminEnginePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Engine Bridge</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <p className="text-sm text-text-secondary mb-4">
          Export submitted actions to the Python election engine, run a turn, and import the results
          back into the database. The engine must be running at the configured URL.
        </p>
        <EngineBridge />
      </AeroPanel>
    </div>
  )
}
