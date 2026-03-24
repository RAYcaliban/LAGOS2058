/**
 * Political Capital (PC) cost calculator for LAGOS 2058.
 *
 * Pure function that computes the PC cost for any campaign action given
 * its type, parameters, and targeting information.  Ported from the
 * Python `compute_action_cost()` reference implementation.
 */

import {
  PC_COSTS,
  ACTION_TARGET_SCOPE,
  ENDORSER_TARGET_SCOPE,
} from '@/lib/constants/actions';
import type { ActionType, EndorserType, TargetScope } from '@/lib/constants/actions';

// ---------------------------------------------------------------------------
// Area surcharge helpers
// ---------------------------------------------------------------------------

/**
 * Compute the geographic-scope surcharge for an action whose base scope
 * is determined by `ACTION_TARGET_SCOPE`.
 *
 * Rules (ported from Python reference):
 * - district scope (e.g. rally): no surcharge
 * - lga scope: national (0 targets) = +3; >10 targets = +1 per 20 beyond 10 (cap +5)
 * - regional scope: national (0 targets) = +3; >1 AZ = +1 per additional AZ
 * - none scope: no surcharge
 */
function areaSurcharge(
  scope: TargetScope,
  nTargetLgas: number,
  nTargetAzs: number,
): number {
  switch (scope) {
    case 'district':
      return 0;

    case 'lga': {
      if (nTargetLgas === 0) return 3; // national reach
      if (nTargetLgas > 10) {
        return Math.min(Math.ceil((nTargetLgas - 10) / 20), 5);
      }
      return 0;
    }

    case 'regional': {
      if (nTargetAzs === 0) return 3; // national reach
      if (nTargetAzs > 1) {
        return Math.min(nTargetAzs - 1, 3); // cap at national rate
      }
      return 0;
    }

    case 'none':
      return 0;

    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Main cost function
// ---------------------------------------------------------------------------

/**
 * Compute the total PC cost for a campaign action.
 *
 * @param actionType  One of the 14 action type identifiers.
 * @param params      Action-specific parameter bag (budget, intensity, etc.).
 * @param nTargetLgas Number of LGAs the action targets (0 = national).
 * @param nTargetAzs  Number of Administrative Zones the action targets (0 = national).
 * @returns           The total PC cost (always >= 0).
 */
export function computeActionCost(
  actionType: string,
  params: Record<string, any>,
  nTargetLgas: number = 0,
  nTargetAzs: number = 0,
): number {
  const type = actionType as ActionType;

  // 1. Base cost from the static table
  const baseCost = PC_COSTS[type] ?? 0;
  let cost = baseCost;

  // 2. Area surcharge
  // For endorsements the scope depends on the endorser_type param
  let scope: TargetScope;
  if (type === 'endorsement') {
    const endorserType = (params.endorser_type ?? 'notable') as EndorserType;
    scope = ENDORSER_TARGET_SCOPE[endorserType] ?? 'district';
  } else {
    scope = ACTION_TARGET_SCOPE[type] ?? 'none';
  }
  cost += areaSurcharge(scope, nTargetLgas, nTargetAzs);

  // 3. Action-specific modifiers
  switch (type) {
    case 'advertising': {
      // budget param (0, 1, 2) adds that much
      const budget = Number(params.budget ?? 0);
      cost += budget;
      // tv medium adds +1
      if (params.medium === 'tv') {
        cost += 1;
      }
      break;
    }

    case 'ground_game': {
      // intensity param (0, 1, 2) adds that much
      const intensity = Number(params.intensity ?? 0);
      cost += intensity;
      break;
    }

    case 'patronage': {
      // tier param (0, 1, 2) adds that much
      const tier = Number(params.tier ?? 0);
      cost += tier;
      break;
    }

    case 'epo_engagement': {
  const scoreChange = Number(params.score_change ?? 0);
  cost += Math.max(0, scoreChange - 3);
  break;
}

    case 'poll': {
      // poll_tier param overrides base cost (1-3)
      const pollTier = Math.min(Number(params.poll_tier ?? 1), 3);
      cost = pollTier;
      break;
    }
  }

  return Math.max(cost, 0);
}
