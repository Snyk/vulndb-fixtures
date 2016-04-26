var Sequelize = require(__dirname + "/lib/sequelize/Sequelize").Sequelize
var s = new Sequelize('sequelize_test', 'root', '')

var Person = s.define('Person', { name: Sequelize.STRING })
var House = s.define('House', { nr: Sequelize.INTEGER })

Person.hasMany('houses', House)
House.belongsTo('owner', Person)

/*House.hasMany('owners', Person, 'houses')
House.hasMany('members', Person, 'households')*/

s.drop(function() {
  s.sync()
})