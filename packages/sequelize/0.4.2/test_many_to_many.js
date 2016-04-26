var Sequelize = require(__dirname + "/lib/sequelize/Sequelize").Sequelize
var s = new Sequelize('sequelize_test', 'root', '', {disableLogging: true})
var sys = require("sys")

var Person = s.define('Person', { name: Sequelize.STRING })
var House = s.define('House', { nr: Sequelize.INTEGER })

/*Person.hasMany('houses', House)
House.belongsTo('owner', Person)*/

Person.hasMany('houses', House, 'owners')
//House.hasMany('owners', Person, 'houses')
Person.hasMany('households', House, 'members')
//House.hasMany('members', Person, 'households')

Sequelize.chainQueries([{drop: s}, {sync: s}, {drop: s}, {sync: s}], function() {
  var o1 = new Person({ name: 'owner1' }),
      o2 = new Person({ name: 'owner2' }),
      h1 = new House({ nr: 1 }),
      h2 = new House({ nr: 2 }),
      h3 = new House({ nr: 3 }),
      h4 = new House({ nr: 4 })
  
  Sequelize.chainQueries([{save: o1}, {save: o2}, {save: h1}, {save: h2}, {save: h3}, {save: h4}], function() {
    o1.setHouses([h1, h2], function(houses) {
      Sequelize.Helper.log("should be [ 1, 2 ]: " + sys.inspect(Sequelize.Helper.Array.map(houses, function(house) { return house.nr })))
      Sequelize.Helper.log("ids of o2 houses: " + sys.inspect(Sequelize.Helper.Array.map(houses, function(house) { return house.id })))
      Sequelize.Helper.log("---------------- setHouses of owner 2 ---------------")
      o2.setHouses([h2, h3, h4], function(houses) {
        Sequelize.Helper.log("should be [ 2, 3, 4 ]: " + sys.inspect(Sequelize.Helper.Array.map(houses, function(house) { return house.nr })))
        Sequelize.Helper.log("ids of o2 houses: " + sys.inspect(Sequelize.Helper.Array.map(houses, function(house) { return house.id })))
        h2.getOwners(function(owners) {
          Sequelize.Helper.log("should be [ \'owner1\', \'owner2\' ]: " + sys.inspect(Sequelize.Helper.Array.map(owners, function(o) { return o.name })))
          Sequelize.Helper.log("-------------------------------------")
          o2.setHouses([], function() {
            h2.getOwners(function(owners) {
              Sequelize.Helper.log("should be [ \'owner1\' ]: " + sys.inspect(Sequelize.Helper.Array.map(owners, function(o) { return o.name })))
            })
          })
        })
      })
    })
  })
})