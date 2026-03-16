interface PageHeaderProps {
  title: string
  subtitle?: string
  label?: string
  image?: string
  /** Color wash to apply over image: 'green' | 'teal' | 'amber' | 'dark' */
  wash?: 'green' | 'teal' | 'amber' | 'dark'
}

const washStyles: Record<string, string> = {
  green: 'rgba(0,135,81,0.6)',
  teal: 'rgba(42,139,154,0.55)',
  amber: 'rgba(100,50,0,0.6)',
  dark: 'rgba(10,15,20,0.7)',
}

export function PageHeader({ title, subtitle, label, image, wash = 'dark' }: PageHeaderProps) {
  return (
    <div className="poster-section">
      {image && (
        <div
          className="poster-bg"
          style={{ backgroundImage: `url('${image}')` }}
        />
      )}
      {!image && (
        <div className="poster-bg" style={{ background: 'linear-gradient(135deg, #0a0f14 0%, #111922 100%)' }} />
      )}
      {/* Color wash */}
      <div
        className="poster-overlay"
        style={{ background: washStyles[wash] }}
      />
      {/* Dark gradient at bottom for legibility */}
      <div className="poster-overlay" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,15,20,0.8) 100%)' }} />

      <div className="poster-content max-w-7xl mx-auto px-6 py-10">
        {label && (
          <p className="font-mono text-nigeria-500/80 text-xs tracking-[6px] uppercase mb-3">
            {label}
          </p>
        )}
        <h1 className="pixel-brand text-4xl md:text-6xl text-white leading-none mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-sm mt-3 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="glow-line max-w-xs mt-4" />
      </div>
    </div>
  )
}
