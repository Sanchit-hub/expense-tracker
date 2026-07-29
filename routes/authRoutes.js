const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const router = express.Router();

function wantsJson(req) {
  return req.headers.accept?.includes("application/json") || req.is("application/json");
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      if (wantsJson(req)) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      return res.status(400).render("login", {
        error: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      if (wantsJson(req)) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      return res.status(401).render("login", {
        error: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      if (wantsJson(req)) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      return res.status(401).render("login", {
        error: "Invalid email or password."
      });
    }

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    if (wantsJson(req)) {
      return res.json({ message: "Login successful", user: req.session.user });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("connect.sid");

    if (wantsJson(req)) {
      return res.json({ message: "Logout successful" });
    }

    return res.redirect("/login");
  });
});

module.exports = router;
