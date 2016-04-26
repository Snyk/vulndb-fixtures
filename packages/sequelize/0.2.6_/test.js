var Sequelize = require(__dirname + "/src/Sequelize").Sequelize

var s = new Sequelize('sequelize_test', 'test', 'test')
var HelloWorld = s.define('HelloWorld', {
  name: Sequelize.STRING,
  date: Sequelize.DATE,
  text: Sequelize.TEXT,
  aFlag: Sequelize.BOOLEAN,
  price: Sequelize.FLOAT
})

HelloWorld.findAll(function(hw) {
  Sequelize.Helper.log(hw)
})

/*Sequelize.chainQueries([{drop: HelloWorld}, {sync: HelloWorld}], function() {
  var a = new HelloWorld({name: 'hello', aFlag: true, price: "2,99", date: new Date(Date.parse("Jul 8, 2005"))})
  SequelizeHelper.log(a)
  
  a.save(function() {
    HelloWorld.findAll(function(helloWorlds) {
      var hw = helloWorlds[0]
      SequelizeHelper.log(hw)
      hw.updateAttributes({aFlag: false, price: 1.50}, function(helloWorld) {
        SequelizeHelper.log(helloWorld)
      })
    })
  })
})*/



/*HelloWorld.drop(function() {
  HelloWorld.sync(function() {
    new HelloWorld({name:'hello'}).save(function(a) {
      SequelizeHelper.log(a)
    })
  })
})*/

/*HelloWorld.drop(function() {
  HelloWorld.sync(function() {
    var connection = require(__dirname+"/lib/nodejs-mysql-native/client").createTCPClient()
    connection.auto_prepare = true
    connection.auth('sequelize_test', 'test', 'test')
    connection
      .query('SHOW CREATE TABLE HelloWorlds')
      .addListener('field', function(r){
        SequelizeHelper.log(r)
      })
    connection.close()    
  })
})*/


/*HelloWorld.drop(function() {
  HelloWorld.sync(function() {
    new HelloWorld({name: 'foo', date: new Date(), text: "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum "}).save(function(foo) {
      HelloWorld.findAll(function(foo) {
        SequelizeHelper.log(foo)
      })
    })
  })
})
*/


/*require(__dirname + "/sequelize")

var s = new Sequelize('sequelize_test', 'test', 'test')
var House = s.define('House', {name: Sequelize.STRING})
var Person = s.define('Person', {name: Sequelize.STRING})

House.hasMany('Persons', Person)
Person.hasMany('Houses', House)

Sequelize.chainQueries([{sync: s}, {drop: s}, {sync: s}], function() {
  var h = new House({name: 'mine'})
  var p1 = new Person({name: 'me'})
  var p2 = new Person({name: 'you'})
  var Association = s.tables.HousesPersons.klass
  
  Sequelize.chainQueries([{save: h}, {save: p1}, {save: p2}], function() {
    h.setPersons([p1, p2], function(persons) {
      SequelizeHelper.log(persons)
      h.setPersons([], function(persons) {
        SequelizeHelper.log(persons)
      })
    })
  })
})





var Project = s.define('Project', {name: Sequelize.STRING})
var Task = s.define('Task', {name: Sequelize.STRING})

Project.hasMany('tasks', Task)
Task.belongsTo('project', Project)

var p = new Project({name: 'sequelize'})
var t1 = new Task({name: 'find sql lib'})
var t2 = new Task({name: 'implement associations'})

Sequelize.chainQueries([{sync: s}, {drop: s}, {sync: s}, {save: p}, {save: t1}, {save: t2}], function() {
  p.setTasks([t1, t2], function(tasks) {
    SequelizeHelper.log(tasks)
  })
})*/