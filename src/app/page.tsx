import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* ── Hero — full viewport, city panorama background ── */}
      <div className="poster-section min-h-screen flex flex-col justify-end">
        <div
          className="poster-bg"
          style={{ backgroundImage: "url('/images/hero-city.jpg')" }}
        />
        {/* Dark gradient: lightest at top, darkest at bottom for text legibility */}
        <div className="poster-overlay color-wash-dark" />
        {/* Extra darkening teal tint */}
        <div className="poster-overlay" style={{ background: 'rgba(10,15,20,0.35)' }} />

        <div className="poster-content max-w-7xl mx-auto px-6 pb-16 pt-32 w-full">
          {/* Stars motif */}
          <div className="mb-2">
            <span className="nigeria-stars pixel-brand text-2xl">★ ★ ★</span>
          </div>

          {/* Main title — dot-matrix pixel style */}
          <h1 className="pixel-brand text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] text-white leading-none mb-6">
            LAGOS<br />2058
          </h1>

          <div className="glow-line max-w-lg mb-8" />

          <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-sans">
            Michael Khalil is stepping down. For twenty-six years he built the Fifth Republic,
            raised GDP per capita from poverty to twenty-six thousand dollars, and never once
            faced a competitive election. Now he is leaving. Nigeria&apos;s first democratic
            election in a generation begins.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link href="/login" className="aero-button text-base px-8 py-3">
              Login
            </Link>
            <Link href="/register" className="register-button-nigeria">
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* ── Nigeria · 2058 — govt building with green wash ── */}
      <div className="poster-section">
        <div
          className="poster-bg"
          style={{ backgroundImage: "url('/images/govt-building.jpg')" }}
        />
        <div className="poster-overlay color-wash-green" />
        <div className="poster-overlay" style={{ background: 'rgba(0,0,0,0.35)' }} />

        <div className="poster-content max-w-7xl mx-auto px-6 py-20">
          <p className="font-pixel text-white/60 text-sm tracking-[8px] uppercase mb-4">
            Nigeria · 2058
          </p>
          <h2 className="pixel-brand text-5xl md:text-7xl text-white mb-8 leading-none">
            THE COUNTRY<br />HE BUILT
          </h2>
          <div className="max-w-2xl space-y-4 text-white/85 text-base leading-relaxed">
            <p>
              Nigeria in 2058 is wildly wealthier than it was in 2028. It is also a country with
              a twenty-year-old question about who that wealth belongs to, an insurgency that has
              never formally ended, a northern population that watched the state systematically
              marginalize their institutions, and a southern urban class that cannot afford housing
              in the cities it built.
            </p>
            <p>
              The Pada, Nigeria&apos;s Western-educated diaspora class, rule by appointment, not
              consent. The Naijin, Sino-Nigerian families, control the financial architecture.
              The north wants Sharia back on formal terms. The south is tired of subsidizing a
              region it believes never bought into the project.
            </p>
            <p className="text-white font-semibold text-lg">
              The first democratic election in thirty years begins now.
            </p>
          </div>
        </div>
      </div>

      {/* ── The Engine — two-column: text left, portrait right ── */}
      <div className="relative bg-bg-primary overflow-hidden">
        {/* Faded portrait accent — right side */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/afrofuture.jpg')",
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.4) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0a0f14 45%, transparent 80%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <p className="naira-header mb-3">The Engine</p>
            <h2 className="pixel-brand text-5xl md:text-6xl text-white mb-8 leading-none">
              174,960<br />VOTER TYPES
            </h2>
            <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
              <p>
                LAGOS uses a spatial voting model. Every party has a position on twenty-eight issue
                dimensions. Every voter has an ideal position on the same dimensions. Closeness
                determines preference — but closeness is not the only thing that matters.
                Religion matters. Ethnicity matters. Salience matters.
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
          </div>
        </div>
      </div>

      {/* ── The Campaign — skyline with teal wash ── */}
      <div className="poster-section">
        <div
          className="poster-bg"
          style={{ backgroundImage: "url('/images/skyline.jpg')" }}
        />
        <div className="poster-overlay color-wash-teal" />
        <div className="poster-overlay" style={{ background: 'rgba(0,0,0,0.45)' }} />

        <div className="poster-content max-w-7xl mx-auto px-6 py-20">
          <p className="font-pixel text-white/60 text-sm tracking-[8px] uppercase mb-4">
            The Campaign
          </p>
          <h2 className="pixel-brand text-5xl md:text-7xl text-white mb-8 leading-none">
            EIGHT TURNS.<br />ONE SHOT.
          </h2>
          <div className="max-w-2xl space-y-4 text-white/85 text-base leading-relaxed">
            <p>
              The campaign runs for eight turns, one week each. You spend Political Capital on
              actions — rallies, advertising, ground game operations, media appearances, patronage,
              EPO engagement. Each action is scored on strategic fit and quality. A better-reasoned
              action has more impact than a poor one.
            </p>
            <p>
              Actions carry risk. Ethnic mobilization and patronage accumulate exposure. Enough
              exposure and a scandal hits, costing valence, Political Capital, and party cohesion.
              A fractured party gets a fraction of the impact. A party at full cohesion operates
              at maximum effectiveness.
            </p>
            <p className="text-white font-semibold">
              Anyone can participate. Players who put in more effort will see it rewarded.
            </p>
          </div>
        </div>
      </div>

      {/* ── Khalil callout + timeline link ── */}
      <div className="relative bg-bg-secondary overflow-hidden">
        <div
          className="absolute right-0 top-0 bottom-0 w-64 bg-cover bg-top grayscale opacity-20"
          style={{ backgroundImage: "url('/images/khalil.jpg')" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="flex-1">
            <p className="naira-header mb-2">The Man Who Built It</p>
            <p className="text-text-secondary text-sm max-w-lg leading-relaxed">
              For twenty-six years, Michael Khalil held Nigeria together by force of personality.
              Now he is gone. Every question he deferred is open. The country goes to the polls.
            </p>
          </div>
          <Link
            href="/about"
            className="shrink-0 text-sm text-aero-400 hover:text-aero-300 transition-colors border border-aero-500/30 px-6 py-3 hover:bg-aero-500/5"
          >
            How did Nigeria get here? Read the timeline &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
