const express    = require('express');
const app        = express();
const bodyParser = require('body-parser')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment]
const database     = require('knex')(configuration)




app.set('port', process.env.PORT || 3000);
app.locals.title = 'Quantified API';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (request, response) => {
  response.send(app.locals.title);
});

app.get('/api/foods/:id', (request, response) => {
  database.raw('SELECT * FROM quantified_self WHERE id=?', [request.params.id])
    .then((data) => {
      if (!data.rows[0]) {
        return response.sendStatus(404);
      }
      response.json(data.rows[0]);
    });
});

app.post('/api/foods', (request, response) => {
  const id = Date.now();
  const food = request.body.food;
  if (!food) {
    return response.send({
      error: 'No food property provided'
    });
  }
  database.raw(
    'INSERT INTO quantified_self (food, created_at) VALUES (?,?) RETURNING *', [
      food, new Date()
    ]).then((data) => {
    let newFood = data.rows[0];
    response.status(201).json(newFood);
  });
});

app.patch('/api/foods/:id', (request, response) => {
  const id = request.params.id;
  const newFood = request.body.food;
  database('quantified_self').where('id', id).update('food', newFood, ['id','food']).then((food) => {
    response.json(food[0]);
  }).catch((error) => {
    if (error) {
      return response.sendStatus(404);
    }
  });
});

app.delete('/api/foods/:id', (request, response) => {
  const id = request.params.id;
  database('quantified_self').where('id', id).del().then((data) => {
    return response.sendStatus(200);
  });
});

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`);
  });
}

module.exports = app;
