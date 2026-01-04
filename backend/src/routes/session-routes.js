const { Router } = require("express");
const { startSession, attachUserToSession } = require("../controllers/session-controller");

const router = Router();

router.post("/start", startSession);
router.post("/attach-user", attachUserToSession);

module.exports = router;
