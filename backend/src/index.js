const express = require("express");
const app = express();
const knex = require('./db/knex');

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
