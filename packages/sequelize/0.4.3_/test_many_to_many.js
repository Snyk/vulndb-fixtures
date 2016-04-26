var Sequelize = require(__dirname + "/lib/sequelize/Sequelize").Sequelize
var s = new Sequelize('sequelize_test', 'root', '', {disableLogging: false})
var sys = require("sys")

var Person = s.define('Person', { name: Sequelize.STRING })
var House = s.define('House', { nr: Sequelize.INTEGER })

Person.hasMany('houses', House, 'owners')
Person.hasMany('households', House, 'members')

Sequelize.chainQueries([{drop: s}, {sync: s}, {drop: s}, {sync: s}], function() {
  var o1 = new Person({ name: 'owner1' }),
      o2 = new Person({ name: 'owner2' }),
      h1 = new House({ nr: 1 }),
      h2 = new House({ nr: 2 }),
      h3 = new House({ nr: 3 }),
      h4 = new House({ nr: 4 })
  
  Sequelize.chainQueries([{save: o1}, {save: o2}, {save: h1}, {save: h2}, {save: h3}, {save: h4}], function() {
    o1.setHouses([h1, h2], function(houses) {
      Sequelize.Helper.log(houses.map(function(h){return h.nr}).join(", "))
      Sequelize.Helper.log("should do no request")
      o1.getHouses(function(houses) {
        Sequelize.Helper.log(houses.map(function(h){return h.nr}).join(", "))
      })
    })
  })
})