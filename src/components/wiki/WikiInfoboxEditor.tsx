'use client'

import { useCallback } from 'react'
import type { WikiPageType, InfoboxData, InfoboxSection, InfoboxField } from '@/lib/types/wiki'
import { getInfoboxTemplate } from '@/lib/wiki/infobox-templates'

interface WikiInfoboxEditorProps {
  pageType: WikiPageType
  value: InfoboxData | null
  onChange: (data: InfoboxData | null) => void
  partyColor?: string | null
}

export function WikiInfoboxEditor({ pageType, value, onChange, partyColor }: WikiInfoboxEditorProps) {
  const template = getInfoboxTemplate(pageType)
  const enabled = value !== null

  const toggle = useCallback(() => {
    if (enabled) {
      onChange(null)
    } else {
      // Initialize from template or empty
      const sections: InfoboxSection[] = template
        ? template.sections.map(s => ({
            heading: s.heading,
            fields: s.fields.map(f => ({ ...f })),
          }))
        : [{ heading: 'Details', fields: [{ key: 'field_1', label: '', value: '' }] }]

      onChange({
        templateType: pageType,
        sections,
      })
    }
  }, [enabled, onChange, pageType, template])

  const updateField = useCallback(
    (sectionIdx: number, fieldIdx: number, updates: Partial<InfoboxField>) => {
      if (!value) return
      const next = { ...value, sections: value.sections.map((s, si) => {
        if (si !== sectionIdx) return s
        return { ...s, fields: s.fields.map((f, fi) => {
          if (fi !== fieldIdx) return f
          return { ...f, ...updates }
        })}
      })}
      onChange(next)
    },
    [value, onChange],
  )

  const addField = useCallback(
    (sectionIdx: number) => {
      if (!value) return
      const next = { ...value, sections: value.sections.map((s, si) => {
        if (si !== sectionIdx) return s
        const key = `field_${Date.now()}`
        return { ...s, fields: [...s.fields, { key, label: '', value: '' }] }
      })}
      onChange(next)
    },
    [value, onChange],
  )

  const removeField = useCallback(
    (sectionIdx: number, fieldIdx: number) => {
      if (!value) return
      const next = { ...value, sections: value.sections.map((s, si) => {
        if (si !== sectionIdx) return s
        return { ...s, fields: s.fields.filter((_, fi) => fi !== fieldIdx) }
      })}
      onChange(next)
    },
    [value, onChange],
  )

  const addSection = useCallback(() => {
    if (!value) return
    onChange({
      ...value,
      sections: [
        ...value.sections,
        { heading: '', fields: [{ key: `field_${Date.now()}`, label: '', value: '' }] },
      ],
    })
  }, [value, onChange])

  const removeSection = useCallback(
    (sectionIdx: number) => {
      if (!value) return
      onChange({
        ...value,
        sections: value.sections.filter((_, si) => si !== sectionIdx),
      })
    },
    [value, onChange],
  )

  const updateSectionHeading = useCallback(
    (sectionIdx: number, heading: string) => {
      if (!value) return
      onChange({
        ...value,
        sections: value.sections.map((s, si) =>
          si === sectionIdx ? { ...s, heading } : s
        ),
      })
    },
    [value, onChange],
  )

  return (
    <fieldset className="wiki-infobox-editor">
      <legend style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Infobox</legend>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        <span style={{ fontSize: '0.8rem' }}>Include infobox</span>
        {template && (
          <span style={{ fontSize: '0.7rem', color: '#666' }}>({template.name} template)</span>
        )}
      </label>

      {enabled && value && (
        <div>
          {/* Image */}
          <div className="wiki-infobox-editor-field">
            <label className="wiki-infobox-editor-label">Image URL</label>
            <input
              type="text"
              value={value.image || ''}
              onChange={(e) => onChange({ ...value, image: e.target.value || undefined })}
              placeholder="https://..."
              className="wiki-edit-input"
              style={{ flex: 1 }}
            />
          </div>
          {value.image && (
            <div className="wiki-infobox-editor-field">
              <label className="wiki-infobox-editor-label">Caption</label>
              <input
                type="text"
                value={value.imageCaption || ''}
                onChange={(e) => onChange({ ...value, imageCaption: e.target.value || undefined })}
                placeholder="Image caption"
                className="wiki-edit-input"
                style={{ flex: 1 }}
              />
            </div>
          )}

          {/* Subtitle */}
          <div className="wiki-infobox-editor-field">
            <label className="wiki-infobox-editor-label">Subtitle</label>
            <input
              type="text"
              value={value.subtitle || ''}
              onChange={(e) => onChange({ ...value, subtitle: e.target.value || undefined })}
              placeholder="e.g. office held"
              className="wiki-edit-input"
              style={{ flex: 1 }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />

          {/* Sections */}
          {value.sections.map((section, si) => (
            <div key={si} className="wiki-infobox-editor-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSectionHeading(si, e.target.value)}
                  placeholder="Section heading"
                  className="wiki-edit-input"
                  style={{ flex: 1, fontWeight: 'bold', fontSize: '0.8rem' }}
                />
                {value.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(si)}
                    className="wiki-infobox-editor-remove-btn"
                    title="Remove section"
                  >
                    &times;
                  </button>
                )}
              </div>

              {section.fields.map((field, fi) => (
                <div key={fi} className="wiki-infobox-editor-field">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(si, fi, { label: e.target.value })}
                    placeholder="Label"
                    className="wiki-edit-input"
                    style={{ width: 120, flexShrink: 0 }}
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(si, fi, { value: e.target.value })}
                    placeholder="Value (use [[Page]] for wiki links)"
                    className="wiki-edit-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeField(si, fi)}
                    className="wiki-infobox-editor-remove-btn"
                    title="Remove field"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addField(si)}
                className="wiki-infobox-editor-add-btn"
              >
                + Add field
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="wiki-infobox-editor-add-btn"
            style={{ marginTop: 4 }}
          >
            + Add section
          </button>
        </div>
      )}
    </fieldset>
  )
}
