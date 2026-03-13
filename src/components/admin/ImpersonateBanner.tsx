'use client'

interface ImpersonateBannerProps {
  partyName: string
  partyColor: string
}

export function ImpersonateBanner({ partyName, partyColor }: ImpersonateBannerProps) {
  return (
    <div
      className="px-4 py-2 text-center text-sm font-bold tracking-widest uppercase border-2 rounded"
      style={{
        backgroundColor: `${partyColor}20`,
        borderColor: partyColor,
        color: '#f59e0b',
      }}
    >
      IMPERSONATING: {partyName}
    </div>
  )
}
