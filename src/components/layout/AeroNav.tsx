'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameConfig } from '@/lib/hooks/useGameConfig'

const BASE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/actions', label: 'Actions', configKey: 'actions_tab_visible' },
  { href: '/map', label: 'Map' },
  { href: '/feed', label: 'Feed' },
  { href: '/forum', label: 'Forum' },
  { href: '/wiki', label: 'Wiki' },
]

export function AeroNav() {
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()
  const { value: actionsVisible } = useGameConfig('actions_tab_visible')

  const navItems = BASE_NAV_ITEMS.filter((item) => {
    if (item.configKey === 'actions_tab_visible') {
      return actionsVisible === true
    }
    return true
  })

  return (
    <nav className="sticky top-0 z-50 border-b border-aero-500/30 bg-bg-primary/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="pixel-brand text-2xl text-white group-hover:text-aero-300 transition-colors leading-none">
              LAGOS
            </span>
            <span className="pixel-brand text-lg leading-none" style={{ color: '#008751' }}>
              2058
            </span>
            <span className="nigeria-stars pixel-brand text-base leading-none ml-1">★★★</span>
          </Link>

          {/* Navigation links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label }) => {
              const isActive = pathname?.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 text-sm font-medium tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? 'text-white border-b-2 border-nigeria-500'
                      : 'text-text-secondary hover:text-text-primary hover:bg-aero-500/5'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right side — auth state */}
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-sm text-text-muted animate-pulse">...</span>
            ) : user && profile ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-text-secondary hover:text-aero-300 transition-colors"
                >
                  {profile.character_name ?? profile.display_name}
                </Link>
                {profile.party_id && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-aero-500/20 text-aero-400 font-mono uppercase tracking-wider">
                    {/* Party abbreviation will be shown if available */}
                    Party
                  </span>
                )}
                <button
                  onClick={signOut}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="glow-line" />
    </nav>
  )
}
