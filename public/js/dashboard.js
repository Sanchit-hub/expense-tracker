const { user, initialExpenses } = window.APP_STATE;

const state = {
  expenses: initialExpenses || [],
  editingExpenseId: null
};

const expenseTableBody = document.getElementById("expenseTableBody");
const totalExpenses = document.getElementById("totalExpenses");
const totalCategories = document.getElementById("totalCategories");
const recentCount = document.getElementById("recentCount");
const categorySummary = document.getElementById("categorySummary");
const recentTransactions = document.getElementById("recentTransactions");
const messageBox = document.getElementById("messageBox");

const expenseForm = document.getElementById("expenseForm");
const filterForm = document.getElementById("filterForm");
const resetFiltersButton = document.getElementById("resetFilters");
const cancelEditButton = document.getElementById("cancelEdit");

function formatCurrency(value) {
  return `Rs. ${Number(value).toFixed(2)}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.className = `alert ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "alert hidden";
}

function renderTable() {
  if (!state.expenses.length) {
    expenseTableBody.innerHTML = `
      <tr>
        <td colspan="${user.role === "admin" ? 6 : 5}" class="empty-state">
          No expenses found for the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  expenseTableBody.innerHTML = state.expenses
    .map((expense) => {
      const actionCell =
        user.role === "admin"
          ? `
            <td class="actions">
              <button class="btn small secondary" data-action="edit" data-id="${expense._id}">Edit</button>
              <button class="btn small danger" data-action="delete" data-id="${expense._id}">Delete</button>
            </td>
          `
          : "";

      return `
        <tr>
          <td>${expense.title}</td>
          <td>${formatCurrency(expense.amount)}</td>
          <td>${expense.category}</td>
          <td>${expense.description || "-"}</td>
          <td>${formatDate(expense.date)}</td>
          ${actionCell}
        </tr>
      `;
    })
    .join("");
}

function renderSummary() {
  const total = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = state.expenses.reduce((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] || 0) + expense.amount;
    return accumulator;
  }, {});

  const recent = [...state.expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  totalExpenses.textContent = formatCurrency(total);
  totalCategories.textContent = Object.keys(categoryTotals).length;
  recentCount.textContent = recent.length;

  categorySummary.innerHTML = Object.keys(categoryTotals).length
    ? Object.entries(categoryTotals)
        .map(
          ([category, amount]) => `
            <div class="summary-chip">
              <span>${category}</span>
              <strong>${formatCurrency(amount)}</strong>
            </div>
          `
        )
        .join("")
    : '<p class="muted">No category totals to show.</p>';

  recentTransactions.innerHTML = recent.length
    ? recent
        .map(
          (expense) => `
            <div class="recent-item">
              <div>
                <strong>${expense.title}</strong>
                <p>${expense.category} | ${formatDate(expense.date)}</p>
              </div>
              <span>${formatCurrency(expense.amount)}</span>
            </div>
          `
        )
        .join("")
    : '<p class="muted">No recent transactions available.</p>';
}

function renderAll() {
  renderTable();
  renderSummary();
}

async function fetchExpenses(params = {}) {
  clearMessage();

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.append(key, value);
    }
  });

  const response = await fetch(`/expenses?${query.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load expenses");
  }

  state.expenses = data;
  renderAll();
}

function resetForm() {
  if (!expenseForm) {
    return;
  }

  expenseForm.reset();
  state.editingExpenseId = null;
  document.getElementById("expenseId").value = "";
  document.getElementById("formTitle").textContent = "Add Expense";
  cancelEditButton.classList.add("hidden");
}

async function saveExpense(event) {
  event.preventDefault();
  clearMessage();

  const payload = {
    title: document.getElementById("title").value.trim(),
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value
  };

  const isEdit = Boolean(state.editingExpenseId);
  const url = isEdit ? `/expenses/${state.editingExpenseId}` : "/expenses";
  const method = isEdit ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save expense");
  }

  showMessage(isEdit ? "Expense updated successfully." : "Expense added successfully.");
  resetForm();
  await fetchExpenses(getFilterValues());
}

function startEdit(id) {
  const expense = state.expenses.find((item) => item._id === id);

  if (!expense || !expenseForm) {
    return;
  }

  state.editingExpenseId = id;
  document.getElementById("expenseId").value = expense._id;
  document.getElementById("title").value = expense.title;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("category").value = expense.category;
  document.getElementById("description").value = expense.description || "";
  document.getElementById("date").value = new Date(expense.date).toISOString().split("T")[0];
  document.getElementById("formTitle").textContent = "Edit Expense";
  cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteExpense(id) {
  const confirmed = window.confirm("Are you sure you want to delete this expense?");

  if (!confirmed) {
    return;
  }

  clearMessage();

  const response = await fetch(`/expenses/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete expense");
  }

  showMessage("Expense deleted successfully.");
  await fetchExpenses(getFilterValues());
}

function getFilterValues() {
  return {
    category: document.getElementById("filterCategory").value.trim(),
    startDate: document.getElementById("filterStartDate").value,
    endDate: document.getElementById("filterEndDate").value
  };
}

expenseTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  try {
    if (action === "edit") {
      startEdit(id);
    }

    if (action === "delete") {
      await deleteExpense(id);
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
});

if (expenseForm) {
  expenseForm.addEventListener("submit", async (event) => {
    try {
      await saveExpense(event);
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  cancelEditButton.addEventListener("click", () => {
    clearMessage();
    resetForm();
  });
}

filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await fetchExpenses(getFilterValues());
  } catch (error) {
    showMessage(error.message, "error");
  }
});

resetFiltersButton.addEventListener("click", async () => {
  filterForm.reset();

  try {
    await fetchExpenses();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

renderAll();
