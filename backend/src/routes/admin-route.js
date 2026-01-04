const express = require("express");
const requireAdmin = require("../middleware/require-admin");
const { getSessionEvents, getSessionProfile, listSessions, listUsers } = require("../controllers/admin-controller");

const router = express.Router();

// Protect all admin routes
router.use(requireAdmin);

router.get("/sessions/:sessionId/events", getSessionEvents);
router.get("/sessions/:sessionId/profile", getSessionProfile);
router.get("/sessions", listSessions);
router.get("/users", listUsers);

module.exports = router;
