import { sampleBudget, type BudgetData } from "../data/sampleBudget";
import { createSupabaseServerClient } from "./supabaseServer";

const BUDGET_STATE_ID = "default";

export type PersistedBudgetState = BudgetData;

export async function getBudgetState(): Promise<PersistedBudgetState> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_budget_state")
    .select("data")
    .eq("id", BUDGET_STATE_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load budget data: ${error.message}`);
  }

  if (!data?.data) {
    const initial = sampleBudget;
    const { error: insertError } = await supabase.from("app_budget_state").upsert({
      id: BUDGET_STATE_ID,
      month_label: initial.monthLabel,
      currency_code: initial.currencyCode,
      data: initial,
    });

    if (insertError) {
      throw new Error(`Failed to seed budget data: ${insertError.message}`);
    }

    return initial;
  }

  return data.data as PersistedBudgetState;
}

export async function saveBudgetState(state: PersistedBudgetState): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("app_budget_state").upsert({
    id: BUDGET_STATE_ID,
    month_label: state.monthLabel,
    currency_code: state.currencyCode,
    data: state,
  });

  if (error) {
    throw new Error(`Failed to save budget data: ${error.message}`);
  }
}
