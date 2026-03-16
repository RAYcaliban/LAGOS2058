interface ComingSoonOverlayProps {
  title: string
  subtitle?: string
  image?: string
}

export function ComingSoonOverlay({ title, subtitle, image }: ComingSoonOverlayProps) {
  return (
    <div className="poster-section min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {image ? (
        <div className="poster-bg" style={{ backgroundImage: `url('${image}')` }} />
      ) : (
        <div className="poster-bg" style={{ background: 'linear-gradient(135deg, #0a0f14 0%, #111922 100%)' }} />
      )}
      <div className="poster-overlay" style={{ background: 'rgba(10,15,20,0.85)' }} />

      <div className="poster-content text-center px-6">
        <p className="font-mono text-nigeria-500/70 text-xs tracking-[8px] uppercase mb-6">
          ▶ FIFTH REPUBLIC · LAGOS 2058
        </p>
        <h1 className="pixel-brand text-6xl md:text-8xl text-white leading-none mb-6">
          {title}
        </h1>
        <div className="glow-line max-w-xs mx-auto mb-8" />
        <div className="inline-block border border-aero-500/30 bg-bg-secondary/80 px-8 py-4">
          <span className="pixel-brand text-xl text-aero-400 tracking-widest">
            COMING SOON
          </span>
        </div>
        {subtitle && (
          <p className="text-white/40 text-sm mt-6 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
