require(__dirname + "/SequelizeHelper")
require(__dirname + "/SequelizeTable")

Sequelize = function(database, username, password, options) {
  this.config = {
    database: database,
    username: username,
    password: password
  }
  this.tables = {}
  this.options = options || {}
}

var classMethods = {
  STRING: 'VARCHAR(255)',
  TEXT: 'VARCHAR(4000)',
  INTEGER: 'INT',
  DATE: 'DATETIME',
  
  sqlQueryFor: function(command, values) {
    var query = null
    switch(command) {
      case 'create':
        query = "CREATE TABLE IF NOT EXISTS %{table} (%{fields})"
        break
      case 'drop':
        query = "DROP TABLE IF EXISTS %{table}"
        break
      case 'select':
        values.fields = values.fields || "*"
        query = "SELECT %{fields} FROM %{table}"
        if(values.where) query += " WHERE %{where}"
        if(values.order) query += " ORDER BY %{order}"
        if(values.group) query += " GROUP BY %{group}"
        if(values.limit) {
          if(values.offset) query += " LIMIT %{offset}, %{limit}"
          else query += " LIMIT %{limit}"
        }
        break
      case 'insert':
        query = "INSERT INTO %{table} (%{fields}) VALUES (%{values})"
        break
      case 'update':
        query = "UPDATE %{table} SET %{values} WHERE id = %{id}"
        break
      case 'delete':
        query = "DELETE FROM %{table} WHERE %{where}"
        if(typeof values.limit == 'undefined') query += " LIMIT 1"
        
        break
    }
    
    return SequelizeHelper.evaluateTemplate(query, values)
  },
  chainQueries: function(queries, callback) {
    // queries = [{method: object}, {method: object, params: [1,2,3]}, {method: object}]
    var executeQuery = function(index) {
      var queryHash = queries[index]
      var method = SequelizeHelper.Array.without(SequelizeHelper.Hash.keys(queryHash), "params")[0]
      var object = queryHash[method]
      var iterator = function() {
        if(queries.length > (index + 1)) executeQuery(index + 1)
        else if (callback) callback()
      }
      
      object[method].apply(object, SequelizeHelper.Array.join(queryHash.params || [], [iterator]))
    }
    if(queries.length > 0) executeQuery(0)
    else if (callback) callback()
  }
}

Sequelize.prototype = {
  get tableNames() {
    var result = []
    SequelizeHelper.Hash.keys(this.tables).forEach(function(tableName) {
      result.push(SequelizeHelper.SQL.asTableName(tableName))
    })
    return result
  },
  
  sync: function(callback) {
    var finished = []
    var tables = this.tables

    SequelizeHelper.Hash.forEach(tables, function(table) {
      table.klass.prepareAssociations()
    })

    if((SequelizeHelper.Hash.keys(this.tables).length == 0) && callback)
      callback()
    else
      SequelizeHelper.Hash.forEach(tables, function(table) {
        table.klass.sync(function() {
          finished.push(true)
          if((finished.length == SequelizeHelper.Hash.keys(tables).length) && callback)
            callback()
        })
      })
  },
  
  drop: function(callback) {
    var finished = []
    var tables = this.tables

    if((SequelizeHelper.Hash.keys(tables).length == 0) && callback) callback()
    else
      SequelizeHelper.Hash.forEach(tables, function(table, tableName) {
        table.klass.drop(function() {
          finished.push(true)
          if(finished.length == SequelizeHelper.Hash.keys(tables).length)
            if(callback) callback()
        })
      })
  },
  
  define: function(name, attributes) {
    attributes.createdAt = 'DATETIME NOT NULL'
    attributes.updatedAt = 'DATETIME NOT NULL'
    
    var table = new SequelizeTable(this, SequelizeHelper.SQL.asTableName(name), attributes)
    table.attributes = attributes
    this.tables[name] = {klass: table, attributes: attributes}

    table.sequelize = this
    return table
  },
  
  query: function(queryString, callback) {
    var fields = []
    var values = []
    var self = this
    var connection = require(__dirname+"/../lib/nodejs-mysql-native/client").createTCPClient()
    
    connection.auto_prepare = true
    connection
      .auth(this.config.database, this.config.username, this.config.password)
      .addListener('authorized', function() {
        if(!self.options.disableLogging)
          SequelizeHelper.log("Executing the query: " + queryString)
        
        connection
          .query(queryString)
          .addListener('row', function(r){ values.push(r) })
          .addListener('field', function(f){ fields.push(f)})
          .addListener('end', function() {
            if(callback) {
              var result = []
              values.forEach(function(valueArray) {
                var mapping = {}
                for(var i = 0; i < fields.length; i++)
                  mapping[fields[i].name] = valueArray[i]
                result.push(mapping)
              })
              if(callback) callback(result)
            }
          })
        connection.close()
      })
  }
}

SequelizeHelper.Hash.forEach(classMethods, function(method, methodName) {
  Sequelize[methodName] = method
})