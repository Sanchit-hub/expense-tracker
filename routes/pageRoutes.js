const express = require("express");

const Expense = require("../models/Expense");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

function buildDashboardData(expenses) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] || 0) + expense.amount;
    return accumulator;
  }, {});

  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    totalExpenses,
    categoryTotals,
    recentTransactions
  };
}

router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.redirect("/login");
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.render("login", { error: null });
});

router.get("/dashboard", isAuthenticated, async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    const dashboard = buildDashboardData(expenses);

    return res.render("dashboard", {
      user: req.session.user,
      expenses,
      dashboard
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
