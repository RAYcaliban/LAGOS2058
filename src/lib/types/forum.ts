/**
 * Forum type definitions for LAGOS 2058.
 *
 * Covers post categories and the enriched post shape used by UI
 * components (which joins author profile data onto the raw DB row).
 */

// ---------------------------------------------------------------------------
// Forum categories
// ---------------------------------------------------------------------------

export type ForumCategory =
  | 'general'
  | 'news'
  | 'strategy'
  | 'roleplay'
  | 'gm_announcement';

// ---------------------------------------------------------------------------
// Author snapshot embedded in forum post views
// ---------------------------------------------------------------------------

export interface ForumAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  partyId: string | null;
  partyName: string | null;
  partyColor: string | null;
  role: 'player' | 'gm' | 'admin';
}

// ---------------------------------------------------------------------------
// Forum post (with joined author data)
// ---------------------------------------------------------------------------

/**
 * A single forum post as consumed by UI components. This extends the
 * raw `forum_posts` DB row with denormalised author information and an
 * optional list of child replies.
 */
export interface ForumPost {
  id: string;
  author: ForumAuthor;
  parentId: string | null;
  title: string | null;
  content: string;
  category: ForumCategory;
  isGmPost: boolean;
  pinned: boolean;
  createdAt: string;

  /** Nested replies — populated when fetching a thread view. */
  replies?: ForumPost[];

  /** Total reply count (may be provided without full reply objects). */
  replyCount?: number;
}

// ---------------------------------------------------------------------------
// Forum thread summary (used in list views)
// ---------------------------------------------------------------------------

export interface ForumThreadSummary {
  id: string;
  title: string | null;
  category: ForumCategory;
  author: ForumAuthor;
  isGmPost: boolean;
  pinned: boolean;
  createdAt: string;
  lastReplyAt: string | null;
  replyCount: number;
}

// ---------------------------------------------------------------------------
// New post payload (sent from the client)
// ---------------------------------------------------------------------------

export interface ForumPostCreate {
  parentId?: string | null;
  title?: string | null;
  content: string;
  category: ForumCategory;
}
