import { slugifyHeading, stripMarkdown } from '@/lib/utils/slugify'

interface TocEntry {
  level: number
  text: string
  id: string
}

function parseHeadings(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = stripMarkdown(match[2])
      const id = slugifyHeading(match[2])
      entries.push({ level, text, id })
    }
  }
  return entries
}

interface WikiTableOfContentsProps {
  content: string
}

export function WikiTableOfContents({ content }: WikiTableOfContentsProps) {
  const entries = parseHeadings(content)
  if (entries.length < 2) return null

  let h2Counter = 0

  return (
    <div className="wiki-toc">
      <div className="wiki-toc-title">Contents</div>
      <ol>
        {entries.map((entry, i) => {
          if (entry.level === 2) h2Counter++
          if (entry.level === 3) {
            return (
              <li key={i} style={{ marginLeft: '1.5em', listStyle: 'disc' }}>
                <a href={`#${entry.id}`}>{entry.text}</a>
              </li>
            )
          }
          return (
            <li key={i} value={h2Counter}>
              <a href={`#${entry.id}`}>{entry.text}</a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
