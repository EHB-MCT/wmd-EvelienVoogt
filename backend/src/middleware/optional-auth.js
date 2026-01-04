const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const auth = req.headers && req.headers.authorization;
  if (!auth) return next();

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();

  const token = parts[1];

  if (!process.env.JWT_SECRET) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the payload as `req.user` (token created in login uses { user_id, username })
    req.user = payload;
  } catch (err) {
    // Invalid token — ignore and proceed as anonymous
  }

  next();
};
