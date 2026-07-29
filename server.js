require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");

const connectDB = require("./config/db");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "expense-tracker-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/", pageRoutes);
app.use("/", authRoutes);
app.use("/expenses", expenseRoutes);

app.use((req, res) => {
  if (req.originalUrl.startsWith("/expenses")) {
    return res.status(404).json({ message: "Route not found" });
  }

  return res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist."
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (req.originalUrl.startsWith("/expenses") || req.originalUrl === "/login") {
    return res.status(err.status || 500).json({
      message: err.message || "Something went wrong"
    });
  }

  return res.status(err.status || 500).render("error", {
    title: "Server Error",
    message: err.message || "Something went wrong"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
