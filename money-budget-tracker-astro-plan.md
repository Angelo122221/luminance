# Money & Budget Tracking Web App — Astro Feature & Page Plan

## 1. App Goal

Build a personal monthly budget tracking web app inspired by a spreadsheet budget template. The app should help users plan income, savings, and expenses, compare projected vs actual amounts, and clearly show the difference each month.

The main idea:

- Users enter projected income and expenses.
- Users enter actual income and expenses.
- The app calculates differences automatically.
- The app summarizes total income, total expenses, savings, and net balance.
- Users can track budget performance by month.

---

## 2. Core Pages

### 2.1 Home Page

**Route:** `/`

**Purpose:**  
Introduce the app and guide users to start tracking their monthly budget.

**Main sections:**

- Hero section with app name and tagline
- Short explanation of what the app does
- Button to open dashboard
- Quick feature highlights:
  - Track income
  - Track expenses
  - Compare projected vs actual
  - View monthly budget summary

**Possible Astro file:**

```txt
src/pages/index.astro
```

---

### 2.2 Dashboard Page

**Route:** `/dashboard`

**Purpose:**  
Show the user’s current month financial overview.

**Main sections:**

- Current selected month
- Total projected income
- Total actual income
- Total projected expenses
- Total actual expenses
- Net projected balance
- Net actual balance
- Difference between projected and actual
- Budget health message

**Example dashboard cards:**

- Income
- Expenses
- Savings
- Net Balance
- Over / Under Budget

**Possible Astro file:**

```txt
src/pages/dashboard.astro
```

---

### 2.3 Monthly Budget Page

**Route:** `/budget/[month]`

**Purpose:**  
Let users manage a full monthly budget.

**Main sections:**

- Income table
- Savings table
- Expenses table
- Budget summary

**Tables should include:**

- Category name
- Projected amount
- Actual amount
- Difference

**Example income categories:**

- Salary / Wages
- Interest Income
- Dividends
- Refunds / Reimbursements
- Business Income
- Pension
- Miscellaneous

**Example savings categories:**

- Emergency Fund
- Transfer to Savings
- Retirement
- Investments
- Education
- Other

**Possible Astro file:**

```txt
src/pages/budget/[month].astro
```

---

### 2.4 Expenses Page

**Route:** `/expenses`

**Purpose:**  
Let users view, add, edit, and remove expense entries.

**Expense groups:**

- Home
- Transportation
- Daily Living
- Entertainment
- Health
- Vacation / Holiday
- Other

**Example Home expenses:**

- Mortgage / Rent
- Home / Rental Insurance
- Electricity
- Gas / Oil
- Water / Sewer / Trash
- Phone
- Internet
- Furnishing / Appliances
- Maintenance / Improvements

**Example Transportation expenses:**

- Car Payments
- Auto Insurance
- Fuel
- Public Transportation
- Repairs / Maintenance
- Registration / License

**Possible Astro file:**

```txt
src/pages/expenses.astro
```

---

### 2.5 Income Page

**Route:** `/income`

**Purpose:**  
Let users manage income sources separately from the full monthly budget.

**Features:**

- Add income source
- Edit projected income
- Edit actual income
- Delete income source
- Show income total
- Show projected vs actual income difference

**Possible Astro file:**

```txt
src/pages/income.astro
```

---

### 2.6 Savings Page

**Route:** `/savings`

**Purpose:**  
Track savings goals and contributions.

**Features:**

- Create savings category
- Set projected monthly savings
- Enter actual monthly savings
- Show savings progress
- Show total savings contribution

**Possible Astro file:**

```txt
src/pages/savings.astro
```

---

### 2.7 Reports Page

**Route:** `/reports`

**Purpose:**  
Show charts and insights about spending and budgeting.

**Main reports:**

- Monthly income vs expenses
- Projected vs actual expenses
- Spending by category
- Savings over time
- Net balance by month

**Possible Astro file:**

```txt
src/pages/reports.astro
```

---

### 2.8 Settings Page

**Route:** `/settings`

**Purpose:**  
Let users customize budget categories and app preferences.

**Settings:**

- Currency symbol
- Default month
- Custom income categories
- Custom expense categories
- Dark mode toggle
- Reset budget data
- Export data

**Possible Astro file:**

```txt
src/pages/settings.astro
```

---

## 3. Suggested Astro Project Structure

```txt
src/
  components/
    BudgetTable.astro
    BudgetSummaryCard.astro
    CategorySection.astro
    DashboardCard.astro
    MonthSelector.astro
    Navbar.astro
    ExpenseForm.astro
    IncomeForm.astro
    SavingsForm.astro

  layouts/
    BaseLayout.astro
    DashboardLayout.astro

  pages/
    index.astro
    dashboard.astro
    income.astro
    expenses.astro
    savings.astro
    reports.astro
    settings.astro
    budget/
      [month].astro

  data/
    defaultCategories.ts
    sampleBudget.ts

  utils/
    budgetCalculations.ts
    formatCurrency.ts
    storage.ts

  styles/
    global.css
```

---

## 4. Main Data Model

### Budget Category

```ts
export type BudgetCategory = {
  id: string;
  name: string;
  type: "income" | "savings" | "expense";
  group?: string;
  projected: number;
  actual: number;
};
```

### Monthly Budget

```ts
export type MonthlyBudget = {
  id: string;
  month: string;
  year: number;
  categories: BudgetCategory[];
};
```

### Budget Summary

```ts
export type BudgetSummary = {
  projectedIncome: number;
  actualIncome: number;
  projectedExpenses: number;
  actualExpenses: number;
  projectedSavings: number;
  actualSavings: number;
  projectedNet: number;
  actualNet: number;
  difference: number;
};
```

---

## 5. Core Functions

### 5.1 Calculate Difference

**File:**

```txt
src/utils/budgetCalculations.ts
```

**Purpose:**  
Calculate the difference between actual and projected values.

```ts
export function calculateDifference(projected: number, actual: number): number {
  return actual - projected;
}
```

---

### 5.2 Calculate Category Total

```ts
export function calculateTotal(items: { projected: number; actual: number }[]) {
  return items.reduce(
    (total, item) => {
      total.projected += item.projected;
      total.actual += item.actual;
      return total;
    },
    { projected: 0, actual: 0 }
  );
}
```

---

### 5.3 Calculate Budget Summary

```ts
import type { BudgetCategory, BudgetSummary } from "../data/types";

export function calculateBudgetSummary(categories: BudgetCategory[]): BudgetSummary {
  const income = categories.filter((item) => item.type === "income");
  const expenses = categories.filter((item) => item.type === "expense");
  const savings = categories.filter((item) => item.type === "savings");

  const incomeTotal = calculateTotal(income);
  const expenseTotal = calculateTotal(expenses);
  const savingsTotal = calculateTotal(savings);

  const projectedNet =
    incomeTotal.projected - expenseTotal.projected - savingsTotal.projected;

  const actualNet =
    incomeTotal.actual - expenseTotal.actual - savingsTotal.actual;

  return {
    projectedIncome: incomeTotal.projected,
    actualIncome: incomeTotal.actual,
    projectedExpenses: expenseTotal.projected,
    actualExpenses: expenseTotal.actual,
    projectedSavings: savingsTotal.projected,
    actualSavings: savingsTotal.actual,
    projectedNet,
    actualNet,
    difference: actualNet - projectedNet,
  };
}
```

---

### 5.4 Format Currency

**File:**

```txt
src/utils/formatCurrency.ts
```

```ts
export function formatCurrency(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}
```

---

### 5.5 Save Budget to Local Storage

**File:**

```txt
src/utils/storage.ts
```

```ts
export function saveBudget(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}
```

---

### 5.6 Load Budget from Local Storage

```ts
export function loadBudget<T>(key: string, fallback: T): T {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return fallback;
  }

  try {
    return JSON.parse(savedData) as T;
  } catch {
    return fallback;
  }
}
```

---

## 6. Key Features

### Must-Have Features

- Monthly budget creation
- Projected income tracking
- Actual income tracking
- Projected expense tracking
- Actual expense tracking
- Automatic difference calculation
- Budget summary dashboard
- Expense categories and groups
- Savings tracking
- Local storage support
- Responsive design for mobile and desktop

---

### Nice-to-Have Features

- Charts for income and expenses
- Category spending breakdown
- Monthly history
- Budget templates
- Custom categories
- Dark mode
- Export budget as CSV
- Import budget from CSV
- Search and filter expenses
- Spending alerts
- Savings goal progress bars

---

### Advanced Features

- User authentication
- Cloud database storage
- Recurring income and expenses
- Multi-currency support
- AI budget suggestions
- PDF report export
- Shared household budget
- Bill reminders
- Calendar view
- Bank transaction import

---

## 7. Suggested Components

### BudgetTable.astro

Displays budget rows with projected, actual, and difference columns.

Props:

```ts
type Props = {
  title: string;
  items: BudgetCategory[];
};
```

---

### CategorySection.astro

Groups related budget categories, such as Home, Transportation, or Health.

Props:

```ts
type Props = {
  groupName: string;
  categories: BudgetCategory[];
};
```

---

### DashboardCard.astro

Displays summary numbers such as total income, total expenses, or net balance.

Props:

```ts
type Props = {
  label: string;
  amount: number;
  helperText?: string;
};
```

---

### MonthSelector.astro

Lets users switch between months.

Props:

```ts
type Props = {
  selectedMonth: string;
  months: string[];
};
```

---

## 8. User Flow

### First-Time User

1. User opens the home page.
2. User clicks “Start Budgeting”.
3. User lands on the dashboard.
4. User selects the current month.
5. User enters projected income.
6. User enters projected expenses.
7. User updates actual values during the month.
8. User checks the budget summary to see if they are over or under budget.

---

### Returning User

1. User opens the dashboard.
2. App loads saved budget data.
3. User reviews the current month.
4. User updates actual income and expenses.
5. User checks reports and category spending.

---

## 9. MVP Build Order

### Phase 1: Static UI

- Build home page
- Build dashboard layout
- Build budget table component
- Add default categories

### Phase 2: Budget Logic

- Add projected and actual inputs
- Add automatic difference calculations
- Add budget summary calculations

### Phase 3: Saving Data

- Save budget data to local storage
- Load saved data on page refresh
- Add reset button

### Phase 4: Reports

- Add simple charts
- Add spending breakdown
- Add month-to-month comparison

### Phase 5: Polish

- Add responsive styling
- Add dark mode
- Add export feature
- Improve empty states and error messages

---

## 10. Design Style

Suggested visual style:

- Clean dashboard layout
- Card-based summaries
- Spreadsheet-like budget table
- Soft background colors
- Clear green/red budget indicators
- Mobile-friendly forms
- Simple navigation sidebar or top navbar

---

## 11. Suggested Navigation

```txt
Home
Dashboard
Monthly Budget
Income
Expenses
Savings
Reports
Settings
```

---

## 12. Example Budget Summary Logic

A user should instantly understand:

- How much money they expected to earn
- How much money they actually earned
- How much they planned to spend
- How much they actually spent
- Whether they stayed within budget
- How much money is left after expenses and savings

Example:

```txt
Projected Income: 62,000
Actual Income: 60,000
Projected Expenses: 40,000
Actual Expenses: 43,500
Projected Net: 22,000
Actual Net: 16,500
Difference: -5,500
```

Budget status:

```txt
You are 5,500 under your projected net budget.
```

---

## 13. Recommended MVP Routes

For the first version, start with only these routes:

```txt
/
 /dashboard
 /budget/[month]
 /settings
```

After the MVP works, add:

```txt
/income
/expenses
/savings
/reports
```

---

## 14. Final Notes

Start simple. The first working version should feel like a smarter spreadsheet:

- Editable rows
- Automatic totals
- Saved data
- Clear monthly summary

Once that works, add charts, reports, authentication, and advanced tracking.
