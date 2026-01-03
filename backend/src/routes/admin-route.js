const express = require("express");
const {
  getSessionEvents,
  getSessionProfile,
} = require("../controllers/admin-controller");

const router = express.Router();

router.get("/sessions/:sessionId/events", getSessionEvents);

module.exports = router;
