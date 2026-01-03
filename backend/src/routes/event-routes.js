const { Router } = require("express");
const { postEvent } = require("../controllers/event-controller");

const router = Router();

router.post("/", postEvent);

module.exports = router;