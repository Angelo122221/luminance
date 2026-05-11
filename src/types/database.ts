export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      app_budget_state: {
        Row: {
          id: string;
          month_label: string;
          currency_code: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id: string;
          month_label: string;
          currency_code?: string;
          data: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          month_label?: string;
          currency_code?: string;
          data?: Json;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month_label: string;
          currency_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month_label: string;
          currency_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month_label?: string;
          currency_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_entries: {
        Row: {
          id: string;
          budget_id: string;
          user_id: string;
          section: "income" | "savings" | "expenses";
          group_name: string | null;
          category: string;
          projected_amount: number;
          actual_amount: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          user_id: string;
          section: "income" | "savings" | "expenses";
          group_name?: string | null;
          category: string;
          projected_amount?: number;
          actual_amount?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          budget_id?: string;
          user_id?: string;
          section?: "income" | "savings" | "expenses";
          group_name?: string | null;
          category?: string;
          projected_amount?: number;
          actual_amount?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
