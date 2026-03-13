import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'

export default function AdminPage() {
  return (
    <FixedWidthContainer className="py-10">
      <AeroPanel className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500 mb-3">
          GM ADMIN
        </h1>
        <div className="glow-line max-w-xs mx-auto mb-4" />
        <p className="text-text-secondary">Admin panel coming in Phase 9.</p>
      </AeroPanel>
    </FixedWidthContainer>
  )
}
