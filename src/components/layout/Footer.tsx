export function Footer() {
  return (
    <footer className="border-t border-aero-500/30 mt-auto bg-bg-secondary/50">
      <div className="glow-line" />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="pixel-brand text-base text-white">LAGOS</span>
            <span className="pixel-brand text-sm" style={{ color: '#008751' }}>2058</span>
            <span className="nigeria-stars pixel-brand text-sm">★★★</span>
          </div>
          <p className="text-[10px] text-text-muted tracking-wider uppercase">
            Fifth Republic of Nigeria &middot; A Political Campaign Simulation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/GBdTruaCDM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 border border-nigeria-500/50 text-nigeria-400 hover:bg-nigeria-500/20 hover:border-nigeria-500 transition-colors"
          >
            Discord
          </a>
          <a
            href="https://twitter.com/lagos2058"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 border border-aero-500/40 text-aero-400 hover:bg-aero-500/20 hover:border-aero-500 transition-colors"
          >
            Twitter
          </a>
          <a
            href="/about"
            className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white/90 transition-colors"
          >
            About
          </a>
        </div>
      </div>
    </footer>
  )
}
