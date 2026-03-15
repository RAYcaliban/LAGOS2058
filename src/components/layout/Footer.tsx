export function Footer() {
  return (
    <footer className="border-t border-aero-500/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-text-muted tracking-wider">
          LAGOS 2058 &mdash; A Political Campaign Simulation
        </p>
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
