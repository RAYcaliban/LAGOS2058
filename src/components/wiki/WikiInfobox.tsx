import type { WikiPageType } from '@/lib/types/wiki'

interface WikiInfoboxProps {
  title: string
  pageType: WikiPageType
  partyName?: string | null
  partyColor?: string | null
  /** Additional structured fields to display */
  fields?: { label: string; value: string }[]
}

export function WikiInfobox({ title, pageType, partyName, partyColor, fields }: WikiInfoboxProps) {
  return (
    <div className="wiki-infobox">
      {partyColor && <div className="wiki-infobox-color-bar" style={{ backgroundColor: partyColor }} />}
      <div className="wiki-infobox-header">{title}</div>

      <div className="wiki-infobox-row">
        <div className="wiki-infobox-label">Type</div>
        <div className="wiki-infobox-value" style={{ textTransform: 'capitalize' }}>{pageType}</div>
      </div>

      {partyName && (
        <div className="wiki-infobox-row">
          <div className="wiki-infobox-label">Party</div>
          <div className="wiki-infobox-value">
            {partyColor && (
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  backgroundColor: partyColor,
                  marginRight: 6,
                  verticalAlign: 'middle',
                }}
              />
            )}
            {partyName}
          </div>
        </div>
      )}

      {fields?.map((f, i) => (
        <div className="wiki-infobox-row" key={i}>
          <div className="wiki-infobox-label">{f.label}</div>
          <div className="wiki-infobox-value">{f.value}</div>
        </div>
      ))}
    </div>
  )
}
