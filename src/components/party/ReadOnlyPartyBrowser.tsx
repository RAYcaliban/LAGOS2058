'use client'

import { AeroPanel } from '@/components/ui/AeroPanel'
import { PartyBrowser } from './PartyBrowser'

export function ReadOnlyPartyBrowser() {
  return (
    <AeroPanel>
      <h3 className="naira-header mb-4">All Parties</h3>
      <PartyBrowser onJoined={() => {}} readOnly />
    </AeroPanel>
  )
}
