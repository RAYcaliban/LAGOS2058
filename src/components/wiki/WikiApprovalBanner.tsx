import Link from 'next/link'

interface WikiApprovalBannerProps {
  approved: boolean
  approvedRevisionId: string | null
  slug: string
}

export function WikiApprovalBanner({ approved, approvedRevisionId, slug }: WikiApprovalBannerProps) {
  if (approved) {
    return <span className="wiki-canon-badge">Canon</span>
  }

  if (approvedRevisionId) {
    return (
      <div className="wiki-approval-warning">
        This article has been edited since its last approval.{' '}
        <Link href={`/wiki/${slug}?revision=${approvedRevisionId}`}>
          View last approved version
        </Link>
      </div>
    )
  }

  return <span className="wiki-pending-badge">Pending Review</span>
}
