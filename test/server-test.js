const assert  = require('chai').assert
const app     = require('../server')
const request = require('request')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {
  before(done => {
    this.port   = 9876;
    this.server = app.listen(this.port, (error, response) => {
      if(error) { done(error) }
      done()
    })
    this.request = request.defaults({
      baseUrl: 'http//localhost:9876'
    })
  })

  after(() => {
    this.server.close()
  })

  beforeEach((done) => {
    return database.raw(
    'INSERT INTO quantified_self (name, calories, created_at) VALUES (?, ?, ?)',
    [ "Strawberry", "35", new Date() ])
    return database.raw(
      'INSERT INTO quantified_self (name, calories, created_at) VALUES (?, ?, ?)',
      [ "Orange", "55", new Date() ])
  })

  describe("GET /api/foods/:name", () => {

    it('returns a 404 status if food name is missing', (done) => {
      this.request.get("/api/foods/banana", (error, response) => {
        if(error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('returns a food given its name', (done) => {
      this.request.get("/api/foods/strawberry", (error, response) => {
        if(error) { done(error) }
        const id       = 1
        const name     = "strawberry"
        const calories = "35"

        let parsedFood = JSON.parse(response.body)
        assert.equal(parsedFood.id, id)
        assert.equal(parsedFood.name, name)
        assert.equal(parsedFood.calories, calories)
        done()
      })
    })
  })

  describe('POST /api/foods', () => {

    it('returns a 422 status code given invalid attributes', (done) => {
      this.request.post("/api/fods", (error, response) => {
        if(error) { done(error) }
        assert.equal(response.statusCode, 422)
        done()
      })
    })

    it('creates a food object', (done) => {
      const food = {food: {name: 'banana', calories: "45"}}
      this.request.post('/api/foods', { form :food}, (error, response) => {
        const name     = 'pineapple'
        const calories = '65'
        if(error) { done(error) }
        Food.index()
        .then((foods) => {
          if(!foods){
            done(error)
          }
          assert.equal(foods.rowCount, 3)
          assert.equal(foods.rows[2].name, name)
          done()
        })
      })
    })
  })

  describe("PUT /api/foods/edit/:name", () => {

    it("returns a 404 given invalid attributes", (done) => {
      this.request.put("/api/foods/edit/grape", (error, response) => {
        if(error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it("updates a specific foods attributes", (done) => {
      const food = {food: {attrName: "name", attr: "banana"}}
      this.request.put("/api/foods/edit/strawberry", { form: food}, (error, response) => {
        if(error) { done(error)}
        const name = "banana"
        assert.equal(response.statusCode, 201)
        Food.show(name).then((foods) => {
          var foodObject = foods.rows[0]
          assert.equal(foodObject.name, 'banana')
          assert.equal(foodObject.calories, '35')
        }).then(() => {
          Food.show("strawberry").then((foods) => {
            assert.equal(foods.rows[0], undefined)
            done()
          })
        })
      })
    })
  })

  describe("DELETE /api/foods/:name", () => {
    it("removes a given food", (done) => {
      this.request.delete("/api/foods/orange", (error, response) => {
        if(error) { done(error) }
        assert.equal(response.statusCode, 204)
        Food.index().then((foods) => {
          assert.equal(foods.rows.length, 1)
          done()
        })
      })
    })
  })

  describe("DELETE /api/foods", () => {

    it("returns json of all foods in foodList", (done) => {
      this.request.get("/api/foods", (error, response) => {
        const firstId    = 1
        const secondId   = 2
        const firstFood  = "strawberry"
        const secondFood = "orange"

        if(error) { done(error) }

        var parsedFoods = JSON.parse(response.body-parse)

        assert.equal(parsedFoods[0].id, firstId)
        assert.equal(parsedFoods[1].id, secondId)
        assert.equal(parsedFoods[0].name, firstFood)
        assert.equal(parsedFoods[0].id, secondFood)
        assert.equal(parsedFoods.length, 2)
        done()
      })
    })
  })
})
