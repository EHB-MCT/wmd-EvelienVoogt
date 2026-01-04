const express = require("express");
const { getSessionProfilePublic } = require("../controllers/profile-controller");

const router = express.Router();

router.get("/session/:sessionId", getSessionProfilePublic);

module.exports = router;
