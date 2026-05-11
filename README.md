# Budget App

Minimal Astro budget tracker UI with Supabase database foundation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in `.env.local`:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only usage)
4. Run locally:
   ```bash
   npm run dev
   ```

## Database (Supabase)

This repo now includes:
- Migration: `supabase/migrations/20260511133000_budget_schema.sql`
- Seed placeholder: `supabase/seed.sql`
- Typed browser client: `src/lib/supabaseClient.ts`
- Typed server client: `src/lib/supabaseServer.ts`
- DB types: `src/types/database.ts`

Apply schema to linked Supabase project:
```bash
supabase db push
```

## Deploy

- Deploy to Vercel using the root directory.
- Add env vars in Vercel project settings.

## Part 1 Checklist
Pages Checklist
Home Page — /
 Create src/pages/index.astro
 Add app name
 Add short tagline
 Add “Start Budgeting” button
 Link button to /dashboard
 Add feature cards
 Add simple responsive layout

Suggested feature cards:

 Track income
 Track expenses
 Compare projected vs actual
 View monthly summary
Dashboard Page — /dashboard
 Create src/pages/dashboard.astro
 Show selected month
 Add total income card
 Add total expenses card
 Add total savings card
 Add net balance card
 Add budget status message
 Add link to monthly budget page

Dashboard should answer:

 How much money came in?
 How much money went out?
 How much was saved?
 How much is left?
Monthly Budget Page — /budget/current
 Create src/pages/budget/current.astro
 Add Income section
 Add Savings section
 Add Expenses section
 Show projected column
 Show actual column
 Show difference column
 Show total per section
 Show final budget summary

Budget table rows should show:

 Category name
 Projected amount
 Actual amount
 Difference
Settings Page — /settings
 Create src/pages/settings.astro
 Add currency placeholder
 Add month selector placeholder
 Add category settings placeholder
 Add theme placeholder
 Add export data placeholder
 Label features as “Coming soon” where needed
Components Checklist
Layout Components
 Create src/layouts/BaseLayout.astro
 Add page title support
 Add shared navbar
 Add main content wrapper
 Link global CSS
Navigation
 Create src/components/Navbar.astro
 Add links:
 Home
 Dashboard
 Monthly Budget
 Settings
 Make navbar responsive
Dashboard Card
 Create src/components/DashboardCard.astro
 Accept props:
 label
 amount
 helperText
 Format amount as currency
 Use clean card styling
Budget Table
 Create src/components/BudgetTable.astro
 Accept list of budget items
 Display projected, actual, and difference
 Show section totals
 Highlight positive differences
 Highlight negative differences
Category Section
 Create src/components/CategorySection.astro
 Accept group name
 Accept budget items
 Display grouped expense categories
Budget Summary
 Create src/components/BudgetSummary.astro
 Show:
 Total income
 Total expenses
 Total savings
 Net balance
 Difference
Data and Utility Checklist
Sample Budget Data
 Create src/data/sampleBudget.ts
 Add income categories
 Add savings categories
 Add expense categories
 Include projected values
 Include actual values
 Include category groups
Budget Calculations
 Create src/utils/budgetCalculations.ts
 Add calculateDifference
 Add calculateTotal
 Add calculateBudgetSummary
 Make calculations reusable
Currency Formatting
 Create src/utils/formatCurrency.ts
 Use PHP as default currency
 Format numbers like ₱60,000.00
Part 1 Feature Checklist
Must Have
 Static home page
 Static dashboard page
 Static monthly budget page
 Static settings page
 Sample budget data
 Automatic totals from sample data
 Projected vs actual comparison
 Difference calculation
 Responsive design
 Clean navigation
## Not Yet Included in Part 1
 User input forms
 Editing categories
 Local storage
 Database
 Login/register
 Charts
 Export CSV/PDF
 Import spreadsheet
 Budget alerts
