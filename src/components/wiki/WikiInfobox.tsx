import React from 'react'
import Link from 'next/link'
import type { InfoboxData } from '@/lib/types/wiki'

interface WikiInfoboxProps {
  title: string
  partyColor?: string | null
  data: InfoboxData | null
}

/** Returns white or black depending on background luminance. */
function getContrastColor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/** Render wiki links within a single line segment. */
function renderSegment(text: string) {
  const parts = text.split(/\[\[([^\]]+)\]\]/)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const hasPipe = part.includes('|')
          const [target, display] = hasPipe ? part.split('|', 2) : [part, part]
          const trimmedTarget = target.trim()
          if (trimmedTarget.startsWith('w:')) {
            const article = trimmedTarget.slice(2).trim()
            const label = hasPipe ? display.trim() : article
            return <a key={i} href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article)}`} target="_blank" rel="noopener noreferrer">{label}</a>
          }
          if (trimmedTarget.startsWith('c:')) {
            const name = trimmedTarget.slice(2).trim()
            const slug = 'character-' + name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const label = hasPipe ? display.trim() : name
            return <Link key={i} href={`/wiki/${slug}`}>{label}</Link>
          }
          if (trimmedTarget.startsWith('p:')) {
            const name = trimmedTarget.slice(2).trim()
            const slug = 'party-' + name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const label = hasPipe ? display.trim() : name
            return <Link key={i} href={`/wiki/${slug}`}>{label}</Link>
          }
          const slug = trimmedTarget.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return <Link key={i} href={`/wiki/${slug}`}>{display.trim()}</Link>
        }
        return part
      })}
    </>
  )
}

/** Render a value string, supporting <br> line breaks and [[wiki links]]. */
function renderValue(value: string) {
  const lines = value.split(/<br\s*\/?>/i)
  if (lines.length === 1) return renderSegment(value)
  return (
    <>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {renderSegment(line)}
        </React.Fragment>
      ))}
    </>
  )
}

export function WikiInfobox({ title, partyColor, data }: WikiInfoboxProps) {
  if (!data || data.sections.length === 0) return null

  // Check if there are any non-empty fields at all
  const hasContent = data.sections.some(s => s.fields.some(f => f.value.trim()))
  if (!hasContent && !data.image && !data.subtitle) return null

  const headerBg = partyColor || '#e8e0d0'
  const headerColor = partyColor ? getContrastColor(partyColor) : '#000000'
  const sectionBg = partyColor
    ? `${partyColor}22` // 13% opacity
    : '#e8e0d0'

  return (
    <table className="wiki-infobox">
      <tbody>
        {/* Color bar */}
        {partyColor && (
          <tr>
            <td colSpan={2} className="wiki-infobox-colorbar" style={{ backgroundColor: partyColor }} />
          </tr>
        )}

        {/* Title */}
        <tr>
          <th colSpan={2} className="wiki-infobox-title" style={{ backgroundColor: headerBg, color: headerColor }}>
            {title}
          </th>
        </tr>

        {/* Subtitle */}
        {data.subtitle && (
          <tr>
            <td colSpan={2} className="wiki-infobox-subtitle">
              {data.subtitle}
            </td>
          </tr>
        )}

        {/* Image */}
        {data.image && (
          <>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '8px 10px 4px' }}>
                <img
                  src={data.image}
                  alt={data.imageCaption || title}
                  className="wiki-infobox-image"
                />
              </td>
            </tr>
            {data.imageCaption && (
              <tr>
                <td colSpan={2} className="wiki-infobox-caption">
                  {data.imageCaption}
                </td>
              </tr>
            )}
          </>
        )}

        {/* Sections */}
        {data.sections.map((section, si) => {
          const nonEmptyFields = section.fields.filter(f => f.value.trim())
          if (nonEmptyFields.length === 0) return null
          return (
            <React.Fragment key={si}>
              <tr>
                <th colSpan={2} className="wiki-infobox-section-header" style={{ backgroundColor: sectionBg }}>
                  {section.heading}
                </th>
              </tr>
              {nonEmptyFields.map((field, fi) => (
                <tr key={fi}>
                  <th className="wiki-infobox-label">{field.label}</th>
                  <td className="wiki-infobox-value">{renderValue(field.value)}</td>
                </tr>
              ))}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

