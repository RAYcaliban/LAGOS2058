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
              Michael Khalil is stepping down. For twenty-six years he built the Fifth Republic,
              raised GDP per capita from poverty to twenty-six thousand dollars, and never once
              faced a competitive election. Now he is leaving. Nigeria&apos;s first democratic
              election in a generation begins. The country he built is going to the polls.
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

      {/* Situation */}
      <FixedWidthContainer className="pb-8">
        <div className="border border-aero-500/10 rounded bg-bg-secondary/50 p-6 space-y-3 text-sm text-text-secondary leading-relaxed max-w-3xl mx-auto">
          <p className="text-text-muted font-mono text-xs tracking-widest uppercase mb-3">
            Nigeria · 2058
          </p>
          <p>
            Nigeria in 2058 is wildly wealthier than it was in 2028. It is also a country with
            a twenty-year-old question about who that wealth belongs to, an insurgency that has
            never formally ended, a northern population that watched the state systematically
            marginalize their institutions, and a southern urban class that cannot afford housing
            in the cities it built. Khalil managed all of this through personal authority. That
            option is no longer available.
          </p>
          <p>
            The Pada, Nigeria&apos;s Western-educated diaspora class, rule by appointment, not
            consent. They are rich, institutionally entrenched, and universally resented outside
            the circles that benefit from them. The Naijin, Sino-Nigerian families, control the
            financial architecture. The north watched two generations of secularization and wants
            Sharia back on formal terms. The south is tired of subsidizing a region it believes
            never bought into the project.
          </p>
          <p className="text-text-primary font-medium">
            The first democratic election in thirty years begins now.
          </p>
        </div>
      </FixedWidthContainer>

      {/* Engine + Campaign */}
      <FixedWidthContainer className="pb-16 space-y-6">
        <div className="border border-aero-500/10 rounded bg-bg-secondary/50 p-6 space-y-3 text-sm text-text-secondary leading-relaxed max-w-3xl mx-auto">
          <p className="text-text-muted font-mono text-xs tracking-widest uppercase mb-3">
            The Engine
          </p>
          <p>
            LAGOS uses a spatial voting model. Every party has a position on twenty-eight issue
            dimensions. Every voter has an ideal position on the same dimensions. Closeness
            determines preference. But closeness is not the only thing that matters. Religion
            matters. Ethnicity matters. Salience matters. A voter in Kano who cares deeply about
            Sharia will weight that dimension far more than a voter in Lagos who cares about
            trade policy.
          </p>
          <p>
            The engine models 174,960 distinct voter types, separated by ethnicity, religion,
            setting, age cohort, education, gender, livelihood, and income bracket. Every election
            runs through a thousand Monte Carlo iterations, producing a distribution of outcomes
            rather than a single fixed result.
          </p>
          <p>
            Your campaign actions shift salience, awareness, and valence. Your manifesto fixes
            your positions. The engine does the rest.
          </p>
        </div>

        <div className="border border-aero-500/10 rounded bg-bg-secondary/50 p-6 space-y-3 text-sm text-text-secondary leading-relaxed max-w-3xl mx-auto">
          <p className="text-text-muted font-mono text-xs tracking-widest uppercase mb-3">
            The Campaign
          </p>
          <p>
            The campaign runs for eight turns, one week each. You spend Political Capital on
            actions. Rallies, advertising, ground game operations, media appearances, patronage,
            EPO engagement. Each action is scored on strategic fit and quality. A better-reasoned
            action has more impact than a poor one.
          </p>
          <p>
            Actions carry risk. Ethnic mobilization and patronage accumulate exposure. Enough
            exposure and a scandal hits, costing valence, Political Capital, and party cohesion.
            Cohesion determines how effective your actions are. A fractured party gets a fraction
            of the impact. A party at full cohesion operates at maximum effectiveness.
          </p>
          <p>
            Anyone can participate. Players who put in more effort will see it rewarded.
          </p>
        </div>

        <div className="text-center pt-4">
          <Link href="/about" className="text-sm text-aero-400 hover:text-aero-300 transition-colors">
            How did Nigeria get here? Read the timeline &rarr;
          </Link>
        </div>
      </FixedWidthContainer>
    </>
  )
}
