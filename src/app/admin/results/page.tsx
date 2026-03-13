'use client'

import { AeroPanel } from '@/components/ui/AeroPanel'
import { ResultImporter } from '@/components/admin/ResultImporter'

export default function AdminResultsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Result Import</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <p className="text-sm text-text-secondary mb-4">
          Upload the JSON output from the Python election engine. The file should contain turn, game_state, party_states, and action_updates.
        </p>
        <ResultImporter />
      </AeroPanel>
    </div>
  )
}
