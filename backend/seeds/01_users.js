exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("users").del();

	// Inserts seed entries
	await knex("users").insert([
		{
			username: "admin",
			first_name: "Admin",
			last_name: "User",
			email: "admin@example.com",
			password_hash: "CHANGE_ME",
		},
		{
			username: "alice",
			first_name: "Alice",
			last_name: "Smith",
			email: "alice@example.com",
			password_hash: "CHANGE_ME",
		},
		{
			username: "bob",
			first_name: "Bob",
			last_name: "Johnson",
			email: "bob@example.com",
			password_hash: "CHANGE_ME",
		},
	]);
};
