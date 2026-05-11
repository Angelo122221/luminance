const dateTimeEl = document.getElementById("live-datetime");
if (dateTimeEl) {
  const formatter = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  const updateDateTime = () => {
    dateTimeEl.textContent = formatter.format(new Date());
  };

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

const formatMoney = (value, currencyCode) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currencyCode || "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const refreshCardTotals = async () => {
  const res = await fetch(`/api/budget?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return;

  const payload = await res.json();
  const budget = payload && payload.budget;
  if (!budget) return;

  const incomeActual = (budget.income || []).reduce((total, item) => total + Number((item && item.actual) || 0), 0);
  const savingsActual = (budget.savings || []).reduce((total, item) => total + Number((item && item.actual) || 0), 0);
  const expenseActual = (budget.expenseGroups || [])
    .flatMap((group) => (group && group.items) || [])
    .reduce((total, item) => total + Number((item && item.actual) || 0), 0);

  const available = incomeActual - savingsActual - expenseActual;
  const currency = budget.currencyCode || "PHP";

  const availableEl = document.getElementById("available-balance");
  const monthEl = document.getElementById("month-label");

  if (availableEl) availableEl.textContent = formatMoney(available, currency);
  if (monthEl) monthEl.textContent = budget.monthLabel || "Current Month";
};

refreshCardTotals();
setInterval(refreshCardTotals, 4000);
