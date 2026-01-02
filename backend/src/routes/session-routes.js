const { Router } = require("express");
const { startSession } = require("../controllers/session-controller");

const router = Router();

router.post("/start", startSession);

module.exports = router;
