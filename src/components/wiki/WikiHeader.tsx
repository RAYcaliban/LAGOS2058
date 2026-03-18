'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function WikiHeader() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/wiki?search=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="wiki-banner">
      <div className="wiki-banner-inner">
        <div>
          <Link href="/wiki" className="wiki-banner-title" style={{ textDecoration: 'none' }}>
            LAGOS 2058 ENCYCLOPAEDIA
          </Link>
          <div className="wiki-banner-subtitle">The Fifth Republic Knowledge Base</div>
        </div>

        <nav>
          <Link href="/wiki">Main Page</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=party">Parties</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=character">People</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=organization">Organizations</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=location">Locations</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=institution">Institutions</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=event">Events</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki?type=lore">History</Link>
          <span className="wiki-sep">|</span>
          <Link href="/wiki/create" style={{ fontWeight: 'bold' }}>Create Article</Link>
        </nav>

        <form onSubmit={handleSearch} className="flex gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wiki..."
            className="wiki-search-input"
          />
          <button type="submit" className="wiki-search-btn">Go</button>
        </form>
      </div>
    </div>
  )
}
