strs = require './stringstream'
fs = require 'fs'
zlib = require 'zlib'

strStream = fs.createReadStream('../node/ChangeLog.gz').pipe(zlib.createGunzip()).pipe(strs('base64'))#.pipe(strs('base64', 'utf8'))

base64Str = ''

strStream.on 'data', (data) ->
  base64Str += data

strStream.on 'end', -> console.log new Buffer(base64Str, 'base64').toString()
