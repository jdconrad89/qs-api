exports.seed = function(knex, Promise) {
  return knex.raw('TRUNCATE foods RESTART IDENTITY')
  .then(() => {
    return Promis.all([
      knex.raw('INSERT INTO FOODS (name, calories, created_at) VALUES (?, ?, ?)',
      ["Strawberry", "35", new Date]
    ),
      knex.raw('INSERT INTO FOODS (name, calories, created_at) VALUES (?, ?, ?)',
      ["Orange", "55", new Date]
    ),
      knex.raw('INSERT INTO FOODS (name, calories, created_at) VALUES (?, ?, ?)',
      ["Banana", "25", new Date]
  ),
    ])
  })
}
