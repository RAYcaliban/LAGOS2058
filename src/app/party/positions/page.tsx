import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { ISSUES } from '@/lib/constants/issues'

export default async function PartyPositionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('party_id')
    .eq('id', user.id)
    .single()

  if (!profile?.party_id) redirect('/dashboard')

  const { data: party } = await supabase
    .from('parties')
    .select('name, full_name')
    .eq('id', profile.party_id)
    .single()

  if (!party) redirect('/dashboard')

  // positions column added by migration 0015 — not yet in generated types
  const { data: partyRaw } = await supabase
    .from('parties')
    .select('*')
    .eq('id', profile.party_id)
    .single()

  const positions = ((partyRaw as Record<string, unknown>)?.positions as number[] | null) ?? null

  return (
    <FixedWidthContainer className="py-6 space-y-6">
      <div>
        <h1 className="naira-header text-2xl mb-1">
          {party.name} — Party Positions
        </h1>
        <p className="text-sm text-text-muted">{party.full_name}</p>
      </div>
      <div className="glow-line" />

      {!positions ? (
        <AeroPanel>
          <p className="text-sm text-text-secondary">
            No positions set yet. Positions will be established after your manifesto is processed.
          </p>
        </AeroPanel>
      ) : (
        <AeroPanel>
          <div className="space-y-1.5">
            {ISSUES.map((issue) => {
              const value = positions[issue.index] ?? 0
              const pct = ((value + 5) / 10) * 100 // -5..+5 → 0..100%
              return (
                <div key={issue.index} className="flex items-center gap-3">
                  <span
                    className="text-xs text-text-secondary w-40 shrink-0 truncate"
                    title={issue.description}
                  >
                    {issue.label}
                  </span>
                  <div className="flex-1 h-4 bg-bg-tertiary/30 rounded-sm relative overflow-hidden">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-text-muted/20" />
                    {/* Position bar */}
                    {value !== 0 && (
                      <div
                        className={`absolute top-0.5 bottom-0.5 rounded-sm ${
                          value > 0 ? 'bg-aero-500/60' : 'bg-parchment-500/60'
                        }`}
                        style={{
                          left: value > 0 ? '50%' : `${pct}%`,
                          width: `${Math.abs(value) * 10}%`,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-mono text-text-muted w-8 text-right">
                    {value > 0 ? '+' : ''}{value.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        </AeroPanel>
      )}
    </FixedWidthContainer>
  )
}
