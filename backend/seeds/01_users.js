const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("users").del();

	// Create password hashes for seeded users
	const adminHash = await bcrypt.hash("adminpass", 10); // admin / adminpass
	const commonHash = await bcrypt.hash("password", 10); // alice / bob -> password

	// Inserts seed entries
	await knex("users").insert([
		{
			username: "admin",
			first_name: "Admin",
			last_name: "User",
			email: "admin@example.com",
			password_hash: adminHash,
			is_admin: true,
		},
		{
			username: "alice",
			first_name: "Alice",
			last_name: "Smith",
			email: "alice@example.com",
			password_hash: commonHash,
		},
		{
			username: "bob",
			first_name: "Bob",
			last_name: "Johnson",
			email: "bob@example.com",
			password_hash: commonHash,
		},
	]);
};
