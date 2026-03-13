// Markdown rendering pipeline configuration
// Used by wiki pages and forum posts

export const REMARK_PLUGINS = ['remark-gfm']
export const REHYPE_PLUGINS = ['rehype-sanitize']

// These are used dynamically in components that render markdown
// The actual remark/rehype plugins are imported in the components themselves
// to keep this utility lightweight
