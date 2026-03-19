'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import Link from 'next/link'
import type { Components } from 'react-markdown'
import { slugifyHeading, slugifyTitle } from '@/lib/utils/slugify'

/** Recursively extract plain text from React children nodes. */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

/** Replace [[Article Name]] with standard markdown links, skipping code blocks. */
function preprocessWikiLinks(markdown: string): string {
  const parts = markdown.split(/(```[\s\S]*?```|`[^`]+`)/g)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      return part.replace(
        /\[\[([^\]]+)\]\]/g,
        (_, inner: string) => {
          const [target, label] = inner.split('|').map((s) => s.trim())
          if (target.startsWith('w:')) {
            const article = target.slice(2)
            const text = label ?? article
            return `[${text}](https://en.wikipedia.org/wiki/${encodeURIComponent(article)})`
          }
          const text = label ?? target
          return `[${text}](/wiki/${slugifyTitle(target)})`
        }
      )
    })
    .join('')
}

const components: Components = {
  h2: ({ children }) => {
    const id = slugifyHeading(extractText(children))
    return <h2 id={id}>{children}</h2>
  },
  h3: ({ children }) => {
    const id = slugifyHeading(extractText(children))
    return <h3 id={id}>{children}</h3>
  },
  table: ({ children }) => (
    <table className="wiki-table">{children}</table>
  ),
  a: ({ href, children }) => {
    if (href?.startsWith('/wiki')) {
      return <Link href={href}>{children}</Link>
    }
    return <a href={href}>{children}</a>
  },
}

interface WikiArticleContentProps {
  content: string
}

export function WikiArticleContent({ content }: WikiArticleContentProps) {
  return (
    <div className="wiki-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {preprocessWikiLinks(content)}
      </ReactMarkdown>
    </div>
  )
}
