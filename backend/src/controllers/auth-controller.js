async function register(req, res) {
	return res.status(200).json({ ok: true, action: "register" });
}

async function login(req, res) {
	return res.status(200).json({ ok: true, action: "login" });
}

module.exports = { register, login };
