'use client'

import { AeroPanel } from '@/components/ui/AeroPanel'

interface PCCostCalculatorProps {
  actionCost: number
  totalSpent: number
  pcAvailable: number
  hoardingCap: number
}

export function PCCostCalculator({ actionCost, totalSpent, pcAvailable, hoardingCap }: PCCostCalculatorProps) {
  const remainingAfter = pcAvailable - totalSpent - actionCost
  const overBudget = remainingAfter < 0

  return (
    <AeroPanel padding="p-3" className="text-sm">
      <div className="naira-header mb-2">PC Cost</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-text-secondary">This action:</span>
          <span className="font-mono font-bold text-aero-400">{actionCost} PC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Already spent:</span>
          <span className="font-mono">{totalSpent} PC</span>
        </div>
        <div className="beveled-hr" />
        <div className="flex justify-between">
          <span className="text-text-secondary">Available:</span>
          <span className="font-mono">{pcAvailable} PC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">After this action:</span>
          <span className={`font-mono font-bold ${overBudget ? 'text-danger' : 'text-success'}`}>
            {remainingAfter} PC
          </span>
        </div>
        {overBudget && (
          <p className="text-xs text-danger mt-1">
            Not enough PC! You need {Math.abs(remainingAfter)} more.
          </p>
        )}
        {pcAvailable >= hoardingCap - 2 && (
          <p className="text-xs text-warning mt-1">
            Near hoarding cap ({hoardingCap}). Excess PC is lost next turn.
          </p>
        )}
      </div>
    </AeroPanel>
  )
}
