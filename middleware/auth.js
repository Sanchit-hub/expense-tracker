function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    if (req.originalUrl.startsWith("/expenses")) {
      return res.status(401).json({ message: "Please login first" });
    }

    return res.redirect("/login");
  }

  return next();
}

function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
}

module.exports = {
  isAuthenticated,
  isAdmin
};
