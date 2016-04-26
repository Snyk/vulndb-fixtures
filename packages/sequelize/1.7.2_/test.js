var Sequelize = require('./index')
var sequelize = new Sequelize('sequelize_test', 'root', null)
var User = sequelize.define('User', { name: Sequelize.STRING })
User.sync({ force: true }).success(function() {
sequelize.transaction(function(t) {
  var options = { raw: true, transaction: t }

  sequelize
    .query('SET FOREIGN_KEY_CHECKS = 0', null, options)
    .then(function() {
      return sequelize.query('truncate table Users', null, options)
    })
    .then(function() {
      return sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, options)
    })
    .then(function() {
      return t.commit()
    })
}).success(function() {
  // go on here ...
console.log('ok')
})
})
