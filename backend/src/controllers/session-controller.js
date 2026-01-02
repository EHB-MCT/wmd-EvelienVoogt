const crypto = require("crypto");

async function startSession(req, res) {
  const session_id = crypto.randomUUID(); 
  return res.status(201).json({ session_id });
}

module.exports = { startSession };
