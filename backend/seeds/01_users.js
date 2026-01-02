exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    { email: 'admin@example.com', password_hash: 'CHANGE_ME' }
  ]);
};
