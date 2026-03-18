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

/** Render [[wiki links]] in a value string. */
function renderValue(value: string) {
  const parts = value.split(/\[\[([^\]]+)\]\]/)
  if (parts.length === 1) return value
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // Inside [[ ]] — split on | for display vs slug
          const [target, display] = part.includes('|') ? part.split('|', 2) : [part, part]
          const slug = target.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return <Link key={i} href={`/wiki/${slug}`}>{display.trim()}</Link>
        }
        return part
      })}
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

