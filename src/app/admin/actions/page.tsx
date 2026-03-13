import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'

export default function AdminActionsPage() {
  return (
    <FixedWidthContainer className="py-10">
      <AeroPanel>
        <h1 className="naira-header mb-3">Action Management</h1>
        <div className="glow-line mb-4" />
        <p className="text-text-secondary text-sm">Review and export player actions. Coming in Phase 9.</p>
      </AeroPanel>
    </FixedWidthContainer>
  )
}
