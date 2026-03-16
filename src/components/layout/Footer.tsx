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
            Federal Republic of Nigeria &middot; A Political Campaign Simulation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://discord.gg/lagos2058"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-aero-400 transition-colors"
          >
            Discord
          </a>
          <a
            href="https://twitter.com/lagos2058"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-aero-400 transition-colors"
          >
            Twitter
          </a>
          <a
            href="/about"
            className="text-xs text-text-muted hover:text-aero-400 transition-colors"
          >
            About
          </a>
        </div>
      </div>
    </footer>
  )
}
