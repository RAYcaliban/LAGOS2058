/**
 * Strip markdown formatting from text.
 * Removes: images, links (keeps text), inline code (keeps text),
 * bold, italic, strikethrough.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')           // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // links → keep text
    .replace(/`([^`]+)`/g, '$1')               // inline code → keep text
    .replace(/\*\*(.+?)\*\*/g, '$1')           // bold
    .replace(/\*(.+?)\*/g, '$1')               // italic
    .replace(/_(.+?)_/g, '$1')                 // italic underscore
    .replace(/~~(.+?)~~/g, '$1')               // strikethrough
    .trim()
}

/**
 * Generate a URL-safe slug from heading text.
 * Strips markdown first, then lowercases and converts to kebab-case.
 */
export function slugifyHeading(text: string): string {
  const stripped = stripMarkdown(text)
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Generate a page slug from an article title.
 * Collapses consecutive hyphens and truncates to 80 chars.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}
