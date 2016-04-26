var Sequelize = require(__dirname + "/lib/sequelize/Sequelize").Sequelize
var s = new Sequelize('sequelize_test', 'root', '', {disableLogging: false, disableTableNameModification: true})
var sys = require("sys")

var Person = s.define('Person', { name: Sequelize.STRING })
var House = s.define('House', { nr: Sequelize.INTEGER })

var personsAssoc = House.hasMany('persons', Person)
Person.belongsTo('households', House, personsAssoc)

Sequelize.chainQueries([{drop: s}, {sync: s}], function() {
  var p1 = new Person({ name: 'owner1' }),
      p2 = new Person({ name: 'owner2' }),
      h1 = new House({ nr: 1 }),
      h2 = new House({ nr: 2 }),
      h3 = new House({ nr: 3 }),
      h4 = new House({ nr: 4 })
  
  // Sequelize.chainQuery([{save: [p1, p2, h1, h2, h3, h4]}])
  Sequelize.chainQueries([{save: p1}, {save: p2}, {save: h1}, {save: h2}, {save: h3}, {save: h4}], function() {
    p1.setHousehold(h1, function(household) {
      Sequelize.Helper.log(household)
      p2.setHousehold(h1, function(household) {
        Sequelize.Helper.log(household)
        household.getPersons(function(persons) {
          Sequelize.Helper.log(persons)
        })
      })
    })
  })
})