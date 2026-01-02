async function postEvent(req, res) {
  const { session_id, type } = req.body ?? {};

  if (!session_id || typeof session_id !== "string" || !session_id.trim()) {
    return res.status(400).json({ error: "session_id is required (string)" });
  }

  if (!type || typeof type !== "string" || !type.trim()) {
    return res.status(400).json({ error: "type is required (string)" });
  }

  return res.status(200).json({
    ok: true,
    received: {
      session_id: session_id.trim(),
      type: type.trim().toLowerCase(),
    },
  });
}

module.exports = { postEvent };