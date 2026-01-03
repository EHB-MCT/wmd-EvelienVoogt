const express = require("express");
const {
  getSessionEvents,
  getSessionProfile,
} = require("../controllers/admin-controller");

const router = express.Router();

router.get("/sessions/:sessionId/events", getSessionEvents);
router.get("/sessions/:sessionId/profile", getSessionProfile);

module.exports = router;
