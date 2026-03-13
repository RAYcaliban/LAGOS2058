'use client'

interface DescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  minLength?: number
}

export function DescriptionEditor({
  value,
  onChange,
  error,
  placeholder = 'Describe your action in detail. The GM will use this to evaluate quality and effectiveness...',
  minLength = 20,
}: DescriptionEditorProps) {
  const charCount = value.length
  const isShort = charCount > 0 && charCount < minLength

  return (
    <div className="space-y-1">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        Action Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`aero-input resize-y min-h-[80px] ${error || isShort ? 'border-danger' : ''}`}
      />
      <div className="flex justify-between text-xs">
        <span className={isShort ? 'text-danger' : 'text-text-muted'}>
          {charCount < minLength
            ? `${minLength - charCount} more characters needed`
            : `${charCount} characters`}
        </span>
        {error && <span className="text-danger">{error}</span>}
      </div>
    </div>
  )
}
