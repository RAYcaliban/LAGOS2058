import Link from 'next/link'
import { AeroPanel } from '@/components/ui/AeroPanel'

export function NoPartyPrompt() {
  return (
    <AeroPanel className="text-center">
      <h2 className="naira-header mb-2">No Party</h2>
      <div className="glow-line mb-3" />
      <p className="text-sm text-text-secondary mb-4">
        You are not in a party. Join an existing party or create your own to participate in the campaign.
      </p>
      <Link
        href="/party"
        className="inline-block bg-aero-500/20 text-aero-400 border border-aero-500/40 rounded px-4 py-2 text-sm font-medium hover:bg-aero-500/30 transition-colors"
      >
        Browse & Create Parties
      </Link>
    </AeroPanel>
  )
}
