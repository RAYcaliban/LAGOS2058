import Link from 'next/link'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-aero-500/5 to-transparent pointer-events-none" />
        <FixedWidthContainer className="py-24 relative">
          <div className="text-center space-y-6">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-[8px] text-aero-500">
              LAGOS 2058
            </h1>
            <div className="glow-line max-w-md mx-auto" />
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              A 12-turn political campaign simulation. Lead your party to victory
              across Nigeria&apos;s 774 Local Government Areas in a retrofuturist
              world where every decision shapes the nation.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/login" className="aero-button">
                Login
              </Link>
              <Link href="/register" className="aero-button-ghost">
                Register
              </Link>
            </div>
          </div>
        </FixedWidthContainer>
      </div>

      {/* Feature grid */}
      <FixedWidthContainer className="pb-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-secondary border border-aero-500/10 rounded p-6 space-y-2">
            <h3 className="font-display text-sm tracking-[2px] uppercase text-aero-400">
              8 Availability Zones
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Nigeria restructured into 8 AZs — from the Federal Capital Zone of
              Lagos to the Chad Zone of the far north. Each with unique demographics,
              ethnic compositions, and political dynamics.
            </p>
          </div>
          <div className="bg-bg-secondary border border-aero-500/10 rounded p-6 space-y-2">
            <h3 className="font-display text-sm tracking-[2px] uppercase text-aero-400">
              14 Campaign Actions
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Rallies, advertising, ground game, endorsements, patronage,
              EPO engagement, opposition research, manifestos, fundraising, and more.
              Every action costs Political Capital and shapes voter opinion.
            </p>
          </div>
          <div className="bg-bg-secondary border border-aero-500/10 rounded p-6 space-y-2">
            <h3 className="font-display text-sm tracking-[2px] uppercase text-aero-400">
              28 Issue Dimensions
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              From Sharia jurisdiction to biological enhancement, from AZ
              restructuring to trade policy. Voters care about different issues
              in different regions. Find your constituency.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/about" className="text-sm text-aero-400 hover:text-aero-300 transition-colors">
            Learn more about the world of LAGOS 2058 &rarr;
          </Link>
        </div>
      </FixedWidthContainer>
    </>
  )
}
