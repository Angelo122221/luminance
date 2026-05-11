const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function formatPeso(value) {
  return peso.format(Number(value || 0));
}

function normalizeTitle(title) {
  return (title || "").trim();
}

function createTableRow(item = {}) {
  const projected = Number(item.projected || 0);
  const actual = Number(item.actual || 0);
  const difference = actual - projected;
  const row = document.createElement("tr");
  row.dataset.category = item.category || "";
  row.innerHTML = `
    <td><input class="budget-input budget-input-text" type="text" value="${item.category || ""}" data-field="category" /></td>
    <td><input class="budget-input" type="number" step="0.01" value="${projected}" data-field="projected" /></td>
    <td><input class="budget-input" type="number" step="0.01" value="${actual}" data-field="actual" /></td>
    <td class="${difference > 0 ? "negative" : difference < 0 ? "positive" : "neutral"}" data-field="difference">${formatPeso(difference)}</td>
    <td><button type="button" class="delete-row-button" data-delete-row aria-label="Delete row">Delete</button></td>
  `;
  return row;
}

function updateSectionTotals(table) {
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  let projectedTotal = 0;
  let actualTotal = 0;

  rows.forEach((row) => {
    const projected = Number(row.querySelector('[data-field="projected"]').value || 0);
    const actual = Number(row.querySelector('[data-field="actual"]').value || 0);
    const difference = actual - projected;

    projectedTotal += projected;
    actualTotal += actual;

    const diffCell = row.querySelector('[data-field="difference"]');
    diffCell.textContent = formatPeso(difference);
    diffCell.classList.remove("positive", "negative", "neutral");
    diffCell.classList.add(difference > 0 ? "negative" : difference < 0 ? "positive" : "neutral");
  });

  const totalDiff = actualTotal - projectedTotal;

  table.querySelector('[data-total="projected"]').textContent = formatPeso(projectedTotal);
  table.querySelector('[data-total="actual"]').textContent = formatPeso(actualTotal);

  const totalDiffCell = table.querySelector('[data-total="difference"]');
  totalDiffCell.textContent = formatPeso(totalDiff);
  totalDiffCell.classList.remove("positive", "negative", "neutral");
  totalDiffCell.classList.add(totalDiff > 0 ? "negative" : totalDiff < 0 ? "positive" : "neutral");
}

function buildBudgetPayload() {
  const tables = Array.from(document.querySelectorAll(".budget-table"));
  const budget = {
    monthLabel: document.querySelector(".page-header h1")?.textContent?.replace(" Monthly Budget", "") || "Current Month",
    currencyCode: "PHP",
    income: [],
    savings: [],
    expenseGroups: [],
  };

  tables.forEach((table) => {
    const title = normalizeTitle(table.dataset.tableSection);
    const entries = Array.from(table.querySelectorAll("tbody tr"))
      .map((row) => {
        const category = (row.querySelector('[data-field="category"]')?.value || "").trim();
        return {
          category,
          projected: Number(row.querySelector('[data-field="projected"]').value || 0),
          actual: Number(row.querySelector('[data-field="actual"]').value || 0),
        };
      })
      .filter((entry) => entry.category.length > 0 || entry.projected !== 0 || entry.actual !== 0);

    if (title === "Income") {
      budget.income = entries;
    } else if (title === "Savings") {
      budget.savings = entries;
    } else if (title.startsWith("Expenses:")) {
      budget.expenseGroups.push({
        group: title.replace("Expenses:", "").trim(),
        items: entries,
      });
    }
  });

  return budget;
}

function populateFromBudget(budget) {
  const bySection = new Map();
  bySection.set("Income", budget.income || []);
  bySection.set("Savings", budget.savings || []);
  (budget.expenseGroups || []).forEach((group) => {
    bySection.set(`Expenses: ${group.group}`, group.items || []);
  });

  document.querySelectorAll(".budget-table").forEach((table) => {
    const section = normalizeTitle(table.dataset.tableSection);
    const items = bySection.get(section) || [];

    const body = table.querySelector("tbody");
    body.innerHTML = "";
    if (items.length === 0) {
      body.appendChild(createTableRow());
    } else {
      items.forEach((item) => body.appendChild(createTableRow(item)));
    }

    updateSectionTotals(table);
  });
}

async function loadBudget() {
  const res = await fetch("/api/budget");
  if (!res.ok) throw new Error("Failed to load budget");
  const payload = await res.json();
  populateFromBudget(payload.budget);
}

async function saveBudget() {
  const message = document.getElementById("save-budget-message");

  try {
    if (message) message.textContent = "Saving...";

    const budget = buildBudgetPayload();

    const res = await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save");
    }

    if (message) message.textContent = "Saved automatically.";
  } catch (error) {
    if (message) message.textContent = error instanceof Error ? error.message : "Auto-save failed";
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  let autoSaveTimer;
  const scheduleAutoSave = () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveBudget();
    }, 500);
  };

  const tables = document.querySelectorAll(".budget-table");
  tables.forEach((table) => updateSectionTotals(table));

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const table = target.closest(".budget-table");
    if (!table) return;
    if (target.dataset.field === "category") {
      const row = target.closest("tr");
      if (row) row.dataset.category = target.value.trim();
    }
    updateSectionTotals(table);
    scheduleAutoSave();
  });

  document.querySelectorAll("[data-add-row]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.closest(".table-section");
      const table = section?.querySelector(".budget-table");
      const body = table?.querySelector("tbody");
      if (!table || !body) return;
      body.appendChild(createTableRow());
      updateSectionTotals(table);
      scheduleAutoSave();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const deleteButton = target.closest("[data-delete-row]");
    if (!deleteButton) return;

    const row = deleteButton.closest("tr");
    const table = deleteButton.closest(".budget-table");
    const body = table?.querySelector("tbody");
    if (!row || !table || !body) return;

    row.remove();
    if (body.querySelectorAll("tr").length === 0) {
      body.appendChild(createTableRow());
    }
    updateSectionTotals(table);
    scheduleAutoSave();
  });

  try {
    await loadBudget();
    document.getElementById("save-budget-message").textContent = "Auto-save is on. Changes are saved automatically.";
  } catch (error) {
    document.getElementById("save-budget-message").textContent =
      error instanceof Error ? error.message : "Could not connect to database.";
  }
});
