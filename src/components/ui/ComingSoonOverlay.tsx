import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'

interface ComingSoonOverlayProps {
  title: string
}

export function ComingSoonOverlay({ title }: ComingSoonOverlayProps) {
  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      {/* Grayed-out background */}
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm z-10" />

      {/* Coming Soon badge */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[6px] text-aero-500/40">
            {title}
          </h1>
          <div className="glow-line max-w-xs mx-auto opacity-30" />
          <div className="inline-block border border-aero-500/20 bg-bg-secondary/90 rounded px-6 py-3">
            <span className="font-display text-sm tracking-[4px] uppercase text-aero-400">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Faint placeholder content behind the overlay */}
      <FixedWidthContainer className="py-10 opacity-10 pointer-events-none select-none">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg-secondary border border-aero-500/10 rounded p-6">
              <div className="h-3 w-1/3 bg-aero-500/20 rounded mb-3" />
              <div className="h-2 w-full bg-aero-500/10 rounded mb-2" />
              <div className="h-2 w-2/3 bg-aero-500/10 rounded" />
            </div>
          ))}
        </div>
      </FixedWidthContainer>
    </div>
  )
}
