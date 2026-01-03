const express = require("express");
const app = express();
const knex = require('./db/knex');

app.use(express.json());

const sessionRouter = require("./routes/session-routes");
app.use("/api/sessions", sessionRouter);

const eventsRouter = require("./routes/event-routes");

app.use("/api/events", eventsRouter);
console.log("events router mounted at /api/events");

app.get("/", (req, res) => {
	res.send({ message: "hello" });
});

app.get('/health', async (req, res) => {
	try {
		await knex.raw('select 1+1 as result');
		res.send({ status: 'ok' });
	} catch (err) {
		res.status(500).send({ status: 'error', message: err.message });
	}
});

const port = process.env.BACKEND_PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
