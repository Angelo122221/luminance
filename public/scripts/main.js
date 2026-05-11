const STORAGE_KEY = 'budget-app-state';
const PROTECTED_PATHS = new Set([
  '/dashboard',
  '/income',
  '/expenses',
  '/savings',
  '/reports',
  '/settings',
  '/budget',
]);

const defaultState = {
  month: 'April 2026',
  settings: {
    currency: '$',
    defaultMonth: 'April 2026',
  },
  income: [
    { id: crypto.randomUUID(), name: 'Salary', projected: 4000, actual: 4000 },
  ],
  savings: [
    { id: crypto.randomUUID(), name: 'Emergency Fund', projected: 500, actual: 500 },
  ],
  expenses: [
    { id: crypto.randomUUID(), name: 'Rent', projected: 1200, actual: 1200 },
    { id: crypto.randomUUID(), name: 'Utilities', projected: 250, actual: 220 },
  ],
};

function getState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch (error) {
    return defaultState;
  }
}

function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncToSupabase(state);
}

function getSupabaseClient() {
  const url = window.PUBLIC_SUPABASE_URL;
  const key = window.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !window.supabase) {
    return null;
  }

  return window.supabase.createClient(url, key);
}

async function requireAuth(client) {
  const path = window.location.pathname;
  if (!PROTECTED_PATHS.has(path)) return true;

  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    const nextPath = encodeURIComponent(path);
    window.location.href = `/login?next=${nextPath}`;
    return false;
  }

  return true;
}

async function updateAuthControls(client) {
  const emailNode = document.getElementById('auth-email');
  const logoutButton = document.getElementById('logout-button');
  if (!emailNode || !logoutButton) return;

  const { data } = await client.auth.getUser();
  const user = data?.user;

  if (user?.email) {
    emailNode.textContent = `Signed in: ${user.email}`;
    logoutButton.style.display = 'inline-block';
    logoutButton.onclick = async () => {
      await client.auth.signOut();
      window.location.href = '/login';
    };
  } else {
    emailNode.textContent = '';
    logoutButton.style.display = 'none';
  }
}

async function handleLoginPage(client) {
  if (window.location.pathname !== '/login') return;

  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const message = document.getElementById('auth-message');
  if (!emailInput || !passwordInput || !loginButton || !signupButton || !message) return;

  const nextPath = new URLSearchParams(window.location.search).get('next') || '/dashboard';

  const setMessage = (text) => {
    message.textContent = text;
  };

  loginButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = nextPath;
  });

  signupButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }

    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Account created. You can now log in.');
  });
}

async function syncToSupabase(state) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('budget_state').upsert({ id: 'default', data: state });
  } catch (error) {
    console.warn('Supabase sync failed', error);
  }
}

function formatAmount(value, currency) {
  const amount = Number(value) || 0;
  return `${currency}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function computeTotals(state) {
  const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
  const projectedIncome = sum(state.income, 'projected');
  const actualIncome = sum(state.income, 'actual');
  const projectedSavings = sum(state.savings, 'projected');
  const actualSavings = sum(state.savings, 'actual');
  const projectedExpenses = sum(state.expenses, 'projected');
  const actualExpenses = sum(state.expenses, 'actual');
  const netProjected = projectedIncome - projectedExpenses - projectedSavings;
  const netActual = actualIncome - actualExpenses - actualSavings;

  return {
    projectedIncome,
    actualIncome,
    projectedSavings,
    actualSavings,
    projectedExpenses,
    actualExpenses,
    netProjected,
    netActual,
    difference: netActual - netProjected,
  };
}

function renderDashboard(state) {
  const summary = document.getElementById('dashboard-summary');
  const details = document.getElementById('dashboard-details');
  if (!summary || !details) return;

  const totals = computeTotals(state);
  const cards = [
    { title: 'Projected Income', value: formatAmount(totals.projectedIncome, state.settings.currency) },
    { title: 'Actual Income', value: formatAmount(totals.actualIncome, state.settings.currency) },
    { title: 'Projected Expenses', value: formatAmount(totals.projectedExpenses, state.settings.currency) },
    { title: 'Actual Expenses', value: formatAmount(totals.actualExpenses, state.settings.currency) },
  ];

  summary.innerHTML = cards.map(card => `
    <div class="card">
      <h3>${card.title}</h3>
      <p>${card.value}</p>
    </div>
  `).join('');

  details.innerHTML = `
    <h3>Net performance</h3>
    <p>Projected balance: ${formatAmount(totals.netProjected, state.settings.currency)}</p>
    <p>Actual balance: ${formatAmount(totals.netActual, state.settings.currency)}</p>
    <p>Difference: ${formatAmount(totals.difference, state.settings.currency)}</p>
  `;
}

function renderList(items, containerId, type, state) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p>No entries yet.</p>';
    return;
  }

  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${formatAmount(item.projected, state.settings.currency)}</td>
      <td>${formatAmount(item.actual, state.settings.currency)}</td>
      <td>${formatAmount(item.actual - item.projected, state.settings.currency)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Projected</th>
          <th>Actual</th>
          <th>Difference</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function bindAddEntry(buttonId, inputs, listId, stateKey, state) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener('click', () => {
    const values = inputs.map(({ id, parser = String }) => {
      const input = document.getElementById(id);
      return input ? parser(input.value.trim()) : '';
    });

    const [name, projected, actual] = values;
    if (!name) return;

    state[stateKey].push({
      id: crypto.randomUUID(),
      name,
      projected: Number(projected) || 0,
      actual: Number(actual) || 0,
    });

    inputs.forEach(({ id }) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });

    saveState(state);
    renderCurrentPage(state);
  });
}

function renderReports(state) {
  const totals = computeTotals(state);
  const reportIncomeExpenses = document.getElementById('report-income-expenses');
  const reportProjectedActual = document.getElementById('report-projected-actual');
  const reportNetBalance = document.getElementById('report-net-balance');

  if (reportIncomeExpenses) {
    reportIncomeExpenses.textContent = `${formatAmount(totals.actualIncome, state.settings.currency)} actual vs ${formatAmount(totals.projectedIncome, state.settings.currency)} projected`;
  }
  if (reportProjectedActual) {
    reportProjectedActual.textContent = `${formatAmount(totals.actualExpenses, state.settings.currency)} actual vs ${formatAmount(totals.projectedExpenses, state.settings.currency)} projected`;
  }
  if (reportNetBalance) {
    reportNetBalance.textContent = `${formatAmount(totals.netActual, state.settings.currency)} actual vs ${formatAmount(totals.netProjected, state.settings.currency)} projected`;
  }
}

function renderSettings(state) {
  const currencyInput = document.getElementById('currency-symbol');
  const monthInput = document.getElementById('default-month');
  if (!currencyInput || !monthInput) return;

  currencyInput.value = state.settings.currency;
  monthInput.value = state.settings.defaultMonth;

  const saveButton = document.getElementById('settings-save');
  saveButton?.addEventListener('click', () => {
    state.settings.currency = currencyInput.value.trim() || '$';
    state.settings.defaultMonth = monthInput.value.trim() || state.month;
    state.month = state.settings.defaultMonth;
    saveState(state);
    renderCurrentPage(state);
  });

  const resetButton = document.getElementById('reset-data');
  resetButton?.addEventListener('click', () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });
}

function renderBudgetPage(state) {
  const details = document.getElementById('budget-details');
  const summary = document.getElementById('budget-summary');
  if (!details || !summary) return;

  const totals = computeTotals(state);
  const cards = [
    { title: 'Projected balance', value: formatAmount(totals.netProjected, state.settings.currency) },
    { title: 'Actual balance', value: formatAmount(totals.netActual, state.settings.currency) },
  ];

  summary.innerHTML = cards.map(card => `
    <div class="card">
      <h3>${card.title}</h3>
      <p>${card.value}</p>
    </div>
  `).join('');

  details.innerHTML = `
    <h3>Monthly totals</h3>
    <p>Income: ${formatAmount(totals.actualIncome, state.settings.currency)} / ${formatAmount(totals.projectedIncome, state.settings.currency)}</p>
    <p>Savings: ${formatAmount(totals.actualSavings, state.settings.currency)} / ${formatAmount(totals.projectedSavings, state.settings.currency)}</p>
    <p>Expenses: ${formatAmount(totals.actualExpenses, state.settings.currency)} / ${formatAmount(totals.projectedExpenses, state.settings.currency)}</p>
  `;
}

function renderCurrentPage(state) {
  const page = document.body.dataset.page;
  if (page === 'dashboard') {
    renderDashboard(state);
  }
  if (page === 'income') {
    renderList(state.income, 'income-list', 'income', state);
  }
  if (page === 'expenses') {
    renderList(state.expenses, 'expense-list', 'expenses', state);
  }
  if (page === 'savings') {
    renderList(state.savings, 'saving-list', 'savings', state);
  }
  if (page === 'reports') {
    renderReports(state);
  }
  if (page === 'settings') {
    renderSettings(state);
  }
  if (page === 'budget') {
    renderBudgetPage(state);
  }
}

async function initPage() {
  const client = getSupabaseClient();
  if (client) {
    const canContinue = await requireAuth(client);
    if (!canContinue) return;
    await handleLoginPage(client);
    await updateAuthControls(client);
  }

  const state = getState();
  renderCurrentPage(state);
  bindAddEntry('income-add', [
    { id: 'income-name' },
    { id: 'income-projected', parser: Number },
    { id: 'income-actual', parser: Number },
  ], 'income-list', 'income', state);

  bindAddEntry('expense-add', [
    { id: 'expense-name' },
    { id: 'expense-projected', parser: Number },
    { id: 'expense-actual', parser: Number },
  ], 'expense-list', 'expenses', state);

  bindAddEntry('saving-add', [
    { id: 'saving-name' },
    { id: 'saving-projected', parser: Number },
    { id: 'saving-actual', parser: Number },
  ], 'saving-list', 'savings', state);
}

window.addEventListener('load', initPage);
