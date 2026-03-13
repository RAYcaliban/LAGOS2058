/**
 * Zod validation schemas for the 14 campaign action types in LAGOS 2058.
 *
 * Each schema validates the action-specific parameters together with the
 * common fields shared by every action submission.  Use `getActionSchema()`
 * to retrieve the schema for a given action type, or `validateAction()` for
 * a one-shot parse.
 */

import { z } from 'zod';
import type { ActionType } from '@/lib/types/actions';

// ---------------------------------------------------------------------------
// Common fields shared by every action
// ---------------------------------------------------------------------------

const commonFields = {
  actionType: z.string(),
  language: z.string(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  targetLgas: z.array(z.string()).default([]),
  targetAzs: z.array(z.string()).default([]),
};

// ---------------------------------------------------------------------------
// Per-action-type schemas
// ---------------------------------------------------------------------------

const rallySchema = z.object({
  ...commonFields,
  actionType: z.literal('rally'),
  district: z.string().min(1, 'District is required'),
});

const advertisingSchema = z.object({
  ...commonFields,
  actionType: z.literal('advertising'),
  medium: z.enum(['radio', 'tv', 'internet']),
  budget: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  targetAzs: z.array(z.string()).default([]),
});

const groundGameSchema = z.object({
  ...commonFields,
  actionType: z.literal('ground_game'),
  district: z.string().min(1, 'District is required'),
  intensity: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

const mediaSchema = z.object({
  ...commonFields,
  actionType: z.literal('media'),
  headline: z.string().min(5, 'Headline must be at least 5 characters'),
  angle: z.string().min(1, 'Angle is required'),
});

const endorsementSchema = z.object({
  ...commonFields,
  actionType: z.literal('endorsement'),
  endorser_type: z.enum([
    'traditional_ruler',
    'religious_leader',
    'epo_leader',
    'celebrity',
    'notable',
  ]),
  endorser_name: z.string().min(1, 'Endorser name is required'),
});

const patronageSchema = z.object({
  ...commonFields,
  actionType: z.literal('patronage'),
  tier: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  targetLgas: z.array(z.string()).min(1, 'At least one target LGA is required'),
});

const ethnicMobilizationSchema = z.object({
  ...commonFields,
  actionType: z.literal('ethnic_mobilization'),
  ethnic_group: z.string().min(1, 'Ethnic group is required'),
  targetAzs: z.array(z.string()).default([]),
});

const epoEngagementSchema = z.object({
  ...commonFields,
  actionType: z.literal('epo_engagement'),
  category: z.enum(['security', 'economic', 'social', 'political']),
  zone: z.string().min(1, 'Zone is required'),
  score_change: z.number().min(1).max(5),
});

const oppositionResearchSchema = z.object({
  ...commonFields,
  actionType: z.literal('opposition_research'),
  target_party: z.string().min(1, 'Target party is required'),
});

const crisisResponseSchema = z.object({
  ...commonFields,
  actionType: z.literal('crisis_response'),
  crisis_type: z.string().min(1, 'Crisis type is required'),
  targetLgas: z.array(z.string()).min(1, 'At least one target LGA is required'),
});

const manifestoSchema = z.object({
  ...commonFields,
  actionType: z.literal('manifesto'),
  positions: z.array(
    z.object({
      issue: z.number(),
      position: z.number().min(-1).max(1),
    }),
  ).min(1, 'At least one position is required'),
});

const fundraisingSchema = z.object({
  ...commonFields,
  actionType: z.literal('fundraising'),
  source: z.enum(['domestic', 'diaspora', 'corporate']),
});

const pollSchema = z.object({
  ...commonFields,
  actionType: z.literal('poll'),
  poll_tier: z.number().int().min(1).max(5),
});

const epoIntelligenceSchema = z.object({
  ...commonFields,
  actionType: z.literal('epo_intelligence'),
  zone: z.string().min(1, 'Zone is required'),
  category: z.string().min(1, 'Category is required'),
});

// ---------------------------------------------------------------------------
// Schema registry
// ---------------------------------------------------------------------------

const ACTION_SCHEMAS: Record<ActionType, z.ZodType> = {
  rally: rallySchema,
  advertising: advertisingSchema,
  ground_game: groundGameSchema,
  media: mediaSchema,
  endorsement: endorsementSchema,
  patronage: patronageSchema,
  ethnic_mobilization: ethnicMobilizationSchema,
  epo_engagement: epoEngagementSchema,
  opposition_research: oppositionResearchSchema,
  crisis_response: crisisResponseSchema,
  manifesto: manifestoSchema,
  fundraising: fundraisingSchema,
  poll: pollSchema,
  epo_intelligence: epoIntelligenceSchema,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the Zod schema for a specific action type.
 *
 * @param type  One of the 14 action type identifiers.
 * @returns     The corresponding Zod schema, or `undefined` if the type
 *              is not recognised.
 */
export function getActionSchema(type: ActionType): z.ZodType | undefined {
  return ACTION_SCHEMAS[type];
}

/**
 * Validation result returned by `validateAction()`.
 */
export type ActionValidationResult =
  | { success: true; data: Record<string, any> }
  | { success: false; errors: z.ZodError };

/**
 * Validate an action payload against the schema for its type.
 *
 * @param type  Action type identifier.
 * @param data  Raw payload to validate.
 * @returns     A discriminated result: `{ success: true, data }` on valid
 *              input, `{ success: false, errors }` otherwise.
 */
export function validateAction(
  type: ActionType,
  data: Record<string, any>,
): ActionValidationResult {
  const schema = ACTION_SCHEMAS[type];
  if (!schema) {
    // Build a synthetic ZodError for an unknown action type
    const error = new z.ZodError([
      {
        code: 'custom',
        message: `Unknown action type: ${type}`,
        path: ['actionType'],
      },
    ]);
    return { success: false, errors: error };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as Record<string, any> };
  }
  return { success: false, errors: result.error };
}
