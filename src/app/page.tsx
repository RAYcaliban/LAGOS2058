import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'

export default function HomePage() {
  return (
    <FixedWidthContainer className="py-20">
      <div className="text-center space-y-6">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-[6px] text-aero-500">
          LAGOS 2058
        </h1>
        <div className="glow-line max-w-md mx-auto" />
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          A 12-turn political campaign simulation. Lead your party to victory
          across Nigeria&apos;s 774 Local Government Areas.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a href="/login" className="aero-button">
            Login
          </a>
          <a href="/register" className="aero-button-ghost">
            Register
          </a>
        </div>
      </div>
    </FixedWidthContainer>
  )
}
