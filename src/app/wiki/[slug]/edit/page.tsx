'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { WikiEditForm } from '@/components/wiki/WikiEditForm'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import type { WikiPageType } from '@/lib/types/wiki'

import type { InfoboxData } from '@/lib/types/wiki'

interface PageData {
  title: string
  content: string
  partyId: string | null
  partyColor: string | null
  pageType: string
  infoboxData: InfoboxData | null
}

export default function WikiEditPage() {
  const { slug } = useParams<{ slug: string }>()
  const { profile, isGM, loading: authLoading } = useAuth()
  const router = useRouter()
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/wiki/${slug}`)
      if (!res.ok) {
        router.push('/wiki')
        return
      }
      const data = await res.json()
      setPage(data.page)
      setLoading(false)
    }
    load()
  }, [slug, router])

  // Permission check after data loads
  useEffect(() => {
    if (authLoading || loading || !page || !profile) return

    const isPartyPage = ['party', 'character'].includes(page.pageType)
    const isOwnCharacterPage =
      page.pageType === 'character' && !page.partyId
    const canEdit =
      isGM ||
      (isPartyPage && page.partyId && profile.party_id === page.partyId) ||
      isOwnCharacterPage ||
      !isPartyPage // Rape Theodore #RapeTheodore

    if (!canEdit) {
      setForbidden(true)
    }
  }, [authLoading, loading, page, profile, isGM])

  if (loading || authLoading) {
    return <p style={{ color: '#666' }}>Loading...</p>
  }

  if (forbidden && page) {
    const isPartyPage = ['party', 'character'].includes(page.pageType)
    return (
      <div>
        <WikiBreadcrumbs pageType={page.pageType as WikiPageType} title={page.title} slug={slug} suffix="Edit" />
        <h1 className="wiki-article-title">Permission Denied</h1>
        {isPartyPage ? (
          <p>Only members of the associated party or Game Masters can edit this {page.pageType} page.</p>
        ) : (
          <p>You must be logged in to edit this article.</p>
        )}
        <p><Link href={`/wiki/${slug}`}>Return to article</Link></p>
      </div>
    )
  }

  if (!page) return null

  return (
    <>
      <WikiBreadcrumbs pageType={page.pageType as WikiPageType} title={page.title} slug={slug} suffix="Edit" />
      <WikiEditForm
        slug={slug}
        initialTitle={page.title}
        initialContent={page.content}
        initialInfoboxData={page.infoboxData}
        pageType={page.pageType as WikiPageType}
        partyColor={page.partyColor}
      />
    </>
  )
}
