import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'

export default function MapPage() {
  return (
    <FixedWidthContainer className="py-10">
      <AeroPanel className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500 mb-3">
          ELECTORAL MAP
        </h1>
        <div className="glow-line max-w-xs mx-auto mb-4" />
        <p className="text-text-secondary">
          Interactive map of Nigeria&apos;s 774 LGAs coming in Phase 6.
        </p>
      </AeroPanel>
    </FixedWidthContainer>
  )
}
