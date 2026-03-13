import { AeroPanel } from '@/components/ui/AeroPanel'

export function QualityRubric() {
  return (
    <AeroPanel padding="p-3" className="text-xs">
      <div className="naira-header mb-2">Quality Rubric</div>
      <div className="space-y-1 text-text-secondary">
        <p><span className="text-success font-semibold">8-10:</span> Detailed, creative, strategically sound</p>
        <p><span className="text-aero-400 font-semibold">5-7:</span> Adequate description with clear intent</p>
        <p><span className="text-warning font-semibold">3-4:</span> Vague or generic description</p>
        <p><span className="text-danger font-semibold">1-2:</span> Minimal effort or contradictory</p>
      </div>
      <p className="mt-2 text-text-muted">
        GMs score each action 1-10. Higher quality = stronger effects.
        Include: who, what, where, why, and how.
      </p>
    </AeroPanel>
  )
}
