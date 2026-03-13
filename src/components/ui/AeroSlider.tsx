'use client'

interface AeroSliderProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  formatValue?: (value: number) => string
}

export function AeroSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  showValue = true,
  formatValue = (v) => v.toFixed(1),
}: AeroSliderProps) {
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <label className="text-xs uppercase tracking-widest text-text-secondary">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-mono text-aero-400">{formatValue(value)}</span>
          )}
        </div>
      )}
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-1.5 bg-bg-tertiary rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-aero-500
          [&::-webkit-slider-thumb]:shadow-glow-teal [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}
