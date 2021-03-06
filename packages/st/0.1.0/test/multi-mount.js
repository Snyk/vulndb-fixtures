var st = require('../st.js')
var test = require('tap').test
var port = process.env.PORT || 1337
var util = require('util')
var path = require('path')
var request = require('request')
var middlewareServer
var server
var assert = require('assert')
var fs = require('fs')
var http = require('http')

// mount the dirname on the /test url
var mount1 = st({
  autoindex: true,
  path: path.dirname(__dirname),
  url: '/test',
  cache: {
    fd: {
      max: 3
    }
  }
})

// mount the test dir on the /blerg url
var mount2 = st({
  autoindex: true,
  path: __dirname,
  url: '/blerg',
  cache: {
    fd: {
      max: 3
    }
  }
})

function req (url, headers, cb) {
  if (typeof headers === 'function')
    cb = headers, headers = {}

  var reqs = 0
  var errState = null
  var prev = null

  request({ encoding: null,
            url: 'http://localhost:' + port + url,
            headers: headers }, next)
  request({ encoding: null,
            url: 'http://localhost:' + (port + 1) + url,
            headers: headers }, next)

  function next (er, res, body) {
    if (errState)
      return
    if (er)
      return cb(errState = er, res, body)
    if (++reqs === 2) {
      console.error('done with reqs')
      assert.equal(res.statusCode, prev.res.statusCode)
      assert.deepEqual(res.headers, prev.res.headers)
      assert.equal('' + body, '' + prev.body)
      return cb(er, res, body)
    }
    prev = { res: res, body: body }
  }
}

test('setup middleware server', function (t) {
  // using the middleware approach
  middlewareServer = http.createServer(function (req, res) {
    mount1(req, res, function () {
      mount2(req, res, function () {
        res.statusCode = 404
        return res.end('Not a match: ' + req.url)
      })
    })
  })
  middlewareServer.listen(port, function () {
    t.pass('listening')
    t.end()
  })
})

test('setup regular server', function (t) {
  server = http.createServer(function (req, res) {
    if (!mount1(req, res) && !mount2(req, res)) {
      res.statusCode = 404
      return res.end('Not a match: ' + req.url)
    }
  })
  server.listen(port + 1, function () {
    t.pass('listening')
    t.end()
  })
})


var stEtag
var stExpect = fs.readFileSync(require.resolve('../st.js')).toString()
test('/test/st.js', function (t) {
  req('/test/st.js', function (er, res, body) {
    t.equal(res.statusCode, 200)
    t.ok(res.headers.etag)
    stEtag = res.headers.etag
    t.equal(body.toString(), stExpect)
    t.end()
  })
})

test('/test/st.js 304', function (t) {
  req('/test/st.js', {'if-none-match':stEtag}, function (er, res, body) {
    t.equal(res.statusCode, 304)
    t.notOk(body)
    t.end()
  })
})

var mmEtag
var mmExpect = fs.readFileSync(__filename, 'utf8')
test('/blerg/multi-mount.js', function (t) {
  req('/blerg/multi-mount.js', function (er, res, body) {
    t.equal(res.statusCode, 200)
    t.ok(res.headers.etag)
    mmEtag = res.headers.etag
    t.equal(body.toString(), mmExpect)
    t.end()
  })
})

test('/test/test/multi-mount.js', function (t) {
  req('/test/test/multi-mount.js', function (er, res, body) {
    t.equal(res.statusCode, 200)
    t.equal(mmEtag, res.headers.etag)
    t.equal(body.toString(), mmExpect)
    t.end()
  })
})


var rmEtag
var rmExpect = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8')
var pjEtag
var pjExpect = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')
var idEtag
var idExpect = fs.readFileSync(__dirname + '/fixtures/index.html', 'utf8')
test('just get a few more etags', function(t) {
  var n = 3

  req('/test/package.json', function (er, res, body) {
    if (er)
      throw er
    t.equal(body.toString(), pjExpect)
    pjEtag = res.headers.etag
    if (--n === 0)
      t.end()
  })

  req('/test/README.md', function (er, res, body) {
    if (er)
      throw er
    t.equal(body.toString(), rmExpect)
    rmEtag = res.headers.etag
    if (--n === 0)
      t.end()
  })

  req('/test/test/fixtures/index.html', function (er, res, body) {
    if (er)
      throw er
    t.equal(body.toString(), idExpect)
    idEtag = res.headers.etag
    if (--n === 0)
      t.end()
  })
})

test('many parallel requests', function (t) {
  var n = 50
  var reqs =
    [ ['/test/test/multi-mount.js', mmEtag, mmExpect],
      ['/blerg/multi-mount.js', mmEtag, mmExpect],
      ['/test/st.js', stEtag, stExpect],
      ['/test/README.md', rmEtag, rmExpect],
      ['/test/package.json', pjEtag, pjExpect],
      ['/test/test/fixtures/index.html', idEtag, idExpect],
      ['/blerg/fixtures/index.html', idEtag, idExpect] ]

  var total = n * reqs.length

  for (var i = 0; i < n; i ++) {
    reqs.forEach(function (r) {
      req(r[0], next(r))
    })
  }

  function next (r) { return function (er, res, body) {
    if (er)
      throw er

    t.pass(r[0])
    t.ok(res)
    t.ok(res.headers)
    t.equal(res.headers.etag, r[1])
    t.equal(body.toString(), r[2].toString())

    if (--total === 0)
      t.end()
  }}
})

test('shutdown regular server', function (t) {
  server.close(function () {
    t.pass('closed')
    t.end()
  })
})

test('shutdown middleware server', function (t) {
  middlewareServer.close(function () {
    t.pass('closed')
    t.end()
  })
})
