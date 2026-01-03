const express = require("express");
const {
  getSessionEvents,
  getSessionProfile,
  listSessions,
} = require("../controllers/admin-controller");

const router = express.Router();

router.get("/sessions/:sessionId/events", getSessionEvents);
router.get("/sessions/:sessionId/profile", getSessionProfile);
router.get("/sessions", listSessions);

module.exports = router;
