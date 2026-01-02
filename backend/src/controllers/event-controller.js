async function postEvent(req, res) {
  return res.status(200).json({
    ok: true,
    received: req.body ?? null,
  });
}

module.exports = { postEvent };