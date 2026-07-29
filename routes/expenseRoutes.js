const express = require("express");

const Expense = require("../models/Expense");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

function buildFilters(query) {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filters.date = {};

    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filters.date.$lte = endDate;
    }
  }

  return filters;
}

function validateExpense(body) {
  const { title, amount, category, date } = body;

  if (!title || amount === undefined || amount === null || amount === "" || !category || !date) {
    return "Title, amount, category, and date are required.";
  }

  if (Number.isNaN(Number(amount)) || Number(amount) < 0) {
    return "Amount must be a valid positive number.";
  }

  if (Number.isNaN(new Date(date).getTime())) {
    return "Please provide a valid date.";
  }

  return null;
}

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    const expenses = await Expense.find(filters).sort({ date: -1, createdAt: -1 });

    return res.json(expenses);
  } catch (error) {
    return next(error);
  }
});

router.post("/", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const validationError = validateExpense(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const expense = await Expense.create({
      title: req.body.title.trim(),
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      description: req.body.description?.trim() || "",
      date: req.body.date
    });

    return res.status(201).json(expense);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const validationError = validateExpense(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        amount: Number(req.body.amount),
        category: req.body.category.trim(),
        description: req.body.description?.trim() || "",
        date: req.body.date
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
