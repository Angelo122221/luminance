import type { BudgetItem } from "../data/sampleBudget";

export interface Totals {
  projected: number;
  actual: number;
  difference: number;
}

export function itemDifference(item: BudgetItem): number {
  return item.actual - item.projected;
}

export function calculateTotals(items: BudgetItem[]): Totals {
  const projected = items.reduce((total, item) => total + item.projected, 0);
  const actual = items.reduce((total, item) => total + item.actual, 0);

  return {
    projected,
    actual,
    difference: actual - projected,
  };
}
