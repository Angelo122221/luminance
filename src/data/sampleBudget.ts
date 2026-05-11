export type BudgetSectionType = "income" | "savings" | "expenses";

export interface BudgetItem {
  id?: string;
  category: string;
  projected: number;
  actual: number;
}

export interface ExpenseGroup {
  group: string;
  items: BudgetItem[];
}

export interface BudgetData {
  monthLabel: string;
  currencyCode: string;
  income: BudgetItem[];
  savings: BudgetItem[];
  expenseGroups: ExpenseGroup[];
}

export const sampleBudget: BudgetData = {
  monthLabel: "",
  currencyCode: "PHP",
  income: [],
  savings: [],
  expenseGroups: [],
};
