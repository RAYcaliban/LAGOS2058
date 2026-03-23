'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/players', label: 'Players', icon: '◉' },
  { href: '/admin/parties', label: 'Parties', icon: '⬡' },
  { href: '/admin/turns', label: 'Turns', icon: '⟳' },
  { href: '/admin/actions', label: 'Actions', icon: '⚡' },
  { href: '/admin/feed', label: 'Feed', icon: '⊜' },
  { href: '/admin/results', label: 'Results', icon: '▤' },
  { href: '/admin/engine', label: 'Engine', icon: '⊞' },
  { href: '/admin/sandbox', label: 'Sandbox', icon: '⬢' },
  { href: '/admin/announcements', label: 'Announcements', icon: '◆' },
  { href: '/admin/wiki', label: 'Wiki', icon: '◇' },
  { href: '/admin/config', label: 'Config', icon: '⚙' },
  { href: '/admin/impersonate', label: 'Impersonate', icon: '⊛' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-aero-900/50 bg-bg-secondary/50 backdrop-blur-sm">
      <div className="p-4 border-b border-aero-900/50">
        <h2 className="font-display text-xs font-bold tracking-[4px] text-aero-500 uppercase">
          GM Admin
        </h2>
      </div>
      <nav className="p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-aero-900/60 text-aero-400 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
