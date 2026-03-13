/**
 * Wiki type definitions for LAGOS 2058.
 *
 * Covers page types, the enriched wiki page shape used by UI components,
 * and payload interfaces for creating / updating pages.
 */

// ---------------------------------------------------------------------------
// Wiki page types
// ---------------------------------------------------------------------------

export type WikiPageType = 'party' | 'character' | 'event' | 'lore' | 'general';

// ---------------------------------------------------------------------------
// Editor info snapshot
// ---------------------------------------------------------------------------

export interface WikiEditor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

// ---------------------------------------------------------------------------
// Wiki page (with metadata, as consumed by UI components)
// ---------------------------------------------------------------------------

export interface WikiPage {
  id: string;
  slug: string;
  title: string;

  /** Markdown / rich-text content body. */
  content: string;

  /** Associated party id (null for non-party pages). */
  partyId: string | null;

  /** Associated party name (denormalised for display convenience). */
  partyName: string | null;

  /** Associated party colour hex (denormalised for display convenience). */
  partyColor: string | null;

  pageType: WikiPageType;

  /** Profile of the last user to edit this page (null if unknown). */
  lastEditedBy: WikiEditor | null;

  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Wiki page list item (lighter weight, used in index / search views)
// ---------------------------------------------------------------------------

export interface WikiPageSummary {
  id: string;
  slug: string;
  title: string;
  pageType: WikiPageType;
  partyId: string | null;
  partyName: string | null;
  partyColor: string | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Create / update payloads (sent from the client)
// ---------------------------------------------------------------------------

export interface WikiPageCreate {
  slug: string;
  title: string;
  content: string;
  partyId?: string | null;
  pageType: WikiPageType;
}

export interface WikiPageUpdate {
  title?: string;
  content?: string;
  partyId?: string | null;
  pageType?: WikiPageType;
}
