import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'

export default function AboutPage() {
  return (
    <FixedWidthContainer className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-[4px] text-aero-500">
          LAGOS 2058
        </h1>
        <p className="text-text-muted text-sm mt-1">A Political Campaign Simulation</p>
        <div className="glow-line max-w-xs mx-auto mt-3" />
      </div>

      <AeroPanel>
        <h2 className="naira-header mb-3">The World</h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            It is 2058. Nigeria has been restructured into 8 Availability Zones,
            replacing the old 36-state system. Lagos — megacity of over 40 million
            — has been elevated to its own Federal Capital Zone, the economic and
            political heart of West Africa.
          </p>
          <p>
            The Pan-African Development Authority (PADA) has transformed the
            continent, but its influence is waning. Chinese-backed WAFTA trade
            agreements compete with Western alliances. Biological enhancement
            technology divides society. The Basic Income Credit system strains
            under demographic pressure.
          </p>
          <p>
            A general election approaches. Over a dozen parties compete for power
            across 774 Local Government Areas. Alliances must be forged, EPOs
            courted, manifestos published, and crises navigated. The campaign
            unfolds over 12 turns, each representing a critical phase in the
            race to lead Nigeria into the second half of the century.
          </p>
        </div>
      </AeroPanel>

      <AeroPanel>
        <h2 className="naira-header mb-3">How It Works</h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            Each turn, your party receives <span className="text-aero-400 font-semibold">7 Political Capital (PC)</span> to
            spend on campaign actions: rallies, advertising, patronage, endorsement seeking,
            opposition research, and more. Choose wisely — some actions are cheap but
            narrow, others are expensive but transformative.
          </p>
          <p>
            A Game Master evaluates each action for quality and creativity.
            Higher quality scores yield stronger effects. The simulation engine
            processes all actions simultaneously, updating voter preferences,
            party standings, and EPO relationships across all 774 LGAs.
          </p>
          <p>
            <span className="text-aero-400 font-semibold">14 action types</span> across{' '}
            <span className="text-aero-400 font-semibold">28 issue dimensions</span> and{' '}
            <span className="text-aero-400 font-semibold">8 Availability Zones</span>.
            Speak in 7 campaign languages. Court 4 EPO factions. Manage your
            exposure, cohesion, and momentum. Victory goes to the party that
            best reads the electorate and outmanoeuvres the opposition.
          </p>
        </div>
      </AeroPanel>

      <AeroPanel>
        <h2 className="naira-header mb-3">Availability Zones</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { az: 'AZ1', name: 'Federal Capital', states: 'Lagos', lgas: 20 },
            { az: 'AZ2', name: 'Niger Zone', states: 'Kwara, Niger, Ogun, Oyo', lgas: 94 },
            { az: 'AZ3', name: 'Confluence', states: 'Edo, Ekiti, Kogi, Ondo, Osun', lgas: 103 },
            { az: 'AZ4', name: 'Littoral', states: 'Akwa Ibom, Bayelsa, C.River, Delta, Rivers', lgas: 105 },
            { az: 'AZ5', name: 'Eastern', states: 'Abia, Anambra, Benue, Ebonyi, Enugu, Imo', lgas: 118 },
            { az: 'AZ6', name: 'Central', states: 'FCT, Kano, Nasarawa, Plateau', lgas: 80 },
            { az: 'AZ7', name: 'Chad', states: 'Adamawa, Bauchi, Borno, Gombe, Jigawa, Taraba, Yobe', lgas: 139 },
            { az: 'AZ8', name: 'Savanna', states: 'Kaduna, Katsina, Kebbi, Sokoto, Zamfara', lgas: 115 },
          ].map((zone) => (
            <div key={zone.az} className="bg-bg-tertiary/20 rounded p-2.5">
              <div className="text-aero-400 font-semibold font-mono text-xs">{zone.az}</div>
              <div className="text-text-primary font-medium">{zone.name}</div>
              <div className="text-text-muted text-[10px] mt-0.5">{zone.states}</div>
              <div className="text-text-muted text-[10px]">{zone.lgas} LGAs</div>
            </div>
          ))}
        </div>
      </AeroPanel>
    </FixedWidthContainer>
  )
}
