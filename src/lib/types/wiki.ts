/**
 * Wiki type definitions for LAGOS 2058.
 *
 * Covers page types, the enriched wiki page shape used by UI components,
 * and payload interfaces for creating / updating pages.
 */

// ---------------------------------------------------------------------------
// Wiki page types
// ---------------------------------------------------------------------------

export type WikiPageType = 'party' | 'character' | 'event' | 'lore' | 'general' | 'organization' | 'location' | 'institution';

// ---------------------------------------------------------------------------
// Infobox structured data
// ---------------------------------------------------------------------------

export interface InfoboxField { key: string; label: string; value: string }
export interface InfoboxSection { heading: string; fields: InfoboxField[] }
export interface InfoboxData {
  templateType: WikiPageType
  image?: string
  imageCaption?: string
  subtitle?: string
  sections: InfoboxSection[]
}

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

  infoboxData: InfoboxData | null;

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
  infoboxData?: InfoboxData | null;
}

export interface WikiPageUpdate {
  title?: string;
  content?: string;
  partyId?: string | null;
  pageType?: WikiPageType;
  infoboxData?: InfoboxData | null;
}

// ---------------------------------------------------------------------------
// Wiki page with approval metadata (used on article view pages)
// ---------------------------------------------------------------------------

export interface WikiPageWithApproval extends WikiPage {
  approved: boolean;
  approvedRevisionId: string | null;
}

// ---------------------------------------------------------------------------
// Wiki revision (version history entry)
// ---------------------------------------------------------------------------

export interface WikiRevision {
  id: string;
  wikiPageId: string;
  title: string;
  content: string;
  infoboxData: InfoboxData | null;
  editedBy: WikiEditor | null;
  revisionNumber: number;
  createdAt: string;
  editSummary: string | null;
}
