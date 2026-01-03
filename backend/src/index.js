const express = require("express");
const cors = require("cors");
const app = express();
const knex = require("./db/knex");

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

const optionalAuth = require("./middleware/optional-auth");
app.use(optionalAuth);

const sessionRouter = require("./routes/session-routes");
app.use("/api/sessions", sessionRouter);

const eventsRouter = require("./routes/event-routes");

app.use("/api/events", eventsRouter);
console.log("events router mounted at /api/events");

const authRouter = require("./routes/auth-routes");
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
	res.send({ message: "hello" });
});

app.get("/health", async (req, res) => {
	try {
		await knex.raw("select 1+1 as result");
		res.send({ status: "ok" });
	} catch (err) {
		res.status(500).send({ status: "error", message: err.message });
	}
});

const port = process.env.BACKEND_PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
