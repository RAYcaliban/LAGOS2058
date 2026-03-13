import { AeroPanel } from '@/components/ui/AeroPanel'

interface CharacterCardProps {
  characterName: string
  ethnicity: string | null
  religion: string | null
  bio: string | null
}

export function CharacterCard({ characterName, ethnicity, religion, bio }: CharacterCardProps) {
  return (
    <AeroPanel>
      <h2 className="naira-header mb-1">{characterName}</h2>
      <div className="glow-line mb-3" />
      <div className="flex gap-2 mb-3">
        {ethnicity && (
          <span className="badge badge-info text-[10px]">{ethnicity}</span>
        )}
        {religion && (
          <span className="badge badge-warning text-[10px]">{religion}</span>
        )}
      </div>
      {bio && (
        <p className="text-sm text-text-secondary">{bio}</p>
      )}
    </AeroPanel>
  )
}
