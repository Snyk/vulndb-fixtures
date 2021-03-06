var asar = require('asar')
var child = require('child_process')
var fs = require('fs-extra')
var os = require('os')
var path = require('path')
var series = require('run-series')

var archs = ['ia32', 'x64']
var platforms = ['darwin', 'linux', 'mas', 'win32']

function asarApp (appPath, asarOptions, cb) {
  var src = path.join(appPath)
  var dest = path.join(appPath, '..', 'app.asar')
  asar.createPackageWithOptions(src, dest, asarOptions, function (err) {
    if (err) return cb(err)
    fs.remove(src, function (err) {
      if (err) return cb(err)
      cb(null, dest)
    })
  })
}

function generateFinalBasename (opts) {
  return `${opts.name}-${opts.platform}-${opts.arch}`
}

function generateFinalPath (opts) {
  return path.join(opts.out || process.cwd(), generateFinalBasename(opts))
}

function subOptionWarning (properties, option_name, parameter, value) {
  if (properties.hasOwnProperty(parameter)) {
    console.warn(`WARNING: ${option_name}.${parameter} will be inferred from the main options`)
  }
  properties[parameter] = value
}

function userIgnoreFilter (opts) {
  var ignore = opts.ignore || []
  var ignoreFunc = null

  if (typeof (ignore) === 'function') {
    ignoreFunc = function (file) { return !ignore(file) }
  } else {
    if (!Array.isArray(ignore)) ignore = [ignore]

    ignoreFunc = function filterByRegexes (file) {
      for (var i = 0; i < ignore.length; i++) {
        if (file.match(ignore[i])) {
          return false
        }
      }

      return true
    }
  }

  var normalizedOut = opts.out ? path.resolve(opts.out) : null
  var outIgnores = []
  if (normalizedOut === null || normalizedOut === process.cwd()) {
    platforms.forEach(function (platform) {
      archs.forEach(function (arch) {
        outIgnores.push(path.join(process.cwd(), `${opts.name}-${platform}-${arch}`))
      })
    })
  } else {
    outIgnores.push(normalizedOut)
  }

  return function filter (file) {
    if (outIgnores.indexOf(file) !== -1) {
      return false
    }

    var name = file.split(path.resolve(opts.dir))[1]

    if (path.sep === '\\') {
      // convert slashes so unix-format ignores work
      name = name.replace(/\\/g, '/')
    }

    return ignoreFunc(name)
  }
}

module.exports = {
  archs: archs,
  platforms: platforms,

  isPlatformMac: function isPlatformMac (platform) {
    return platform === 'darwin' || platform === 'mas'
  },

  subOptionWarning: subOptionWarning,

  createDownloadOpts: function createDownloadOpts (opts, platform, arch) {
    if (opts.hasOwnProperty('cache')) {
      console.warn('The cache parameter is deprecated, use download.cache instead')
    }

    if (opts.hasOwnProperty('strict-ssl')) {
      console.warn('The strict-ssl parameter is deprecated, use download.strictSSL instead')
    }

    var downloadOpts = Object.assign({
      cache: opts.cache,
      strictSSL: opts['strict-ssl']
    }, opts.download)

    subOptionWarning(downloadOpts, 'download', 'platform', platform)
    subOptionWarning(downloadOpts, 'download', 'arch', arch)
    subOptionWarning(downloadOpts, 'download', 'version', opts.version)

    return downloadOpts
  },

  generateFinalBasename: generateFinalBasename,
  generateFinalPath: generateFinalPath,

  initializeApp: function initializeApp (opts, templatePath, appRelativePath, callback) {
    // Performs the following initial operations for an app:
    // * Creates temporary directory
    // * Copies template into temporary directory
    // * Copies user's app into temporary directory
    // * Prunes non-production node_modules (if opts.prune is set)
    // * Creates an asar (if opts.asar is set)

    var tempPath
    if (opts.tmpdir === false) {
      tempPath = generateFinalPath(opts)
    } else {
      tempPath = path.join(opts.tmpdir || os.tmpdir(), 'electron-packager', `${opts.platform}-${opts.arch}`, generateFinalBasename(opts))
    }

    // Path to `app` directory
    var appPath = path.join(tempPath, appRelativePath)
    var resourcesPath = path.resolve(appPath, '..')

    var operations = [
      function (cb) {
        fs.move(templatePath, tempPath, {clobber: true}, cb)
      },
      function (cb) {
        fs.copy(opts.dir, appPath, {filter: userIgnoreFilter(opts), dereference: true}, cb)
      },
      function (cb) {
        // Support removing old default_app folder that is now an asar archive
        fs.remove(path.join(resourcesPath, 'default_app'), cb)
      },
      function (cb) {
        fs.remove(path.join(resourcesPath, 'default_app.asar'), cb)
      }
    ]

    // Prune and asar are now performed before platform-specific logic, primarily so that
    // appPath is predictable (e.g. before .app is renamed for mac)
    if (opts.prune) {
      operations.push(function (cb) {
        child.exec('npm prune --production', {cwd: appPath}, cb)
      })
    }

    if (opts.asar) {
      operations.push(function (cb) {
        var asarOptions = {}
        if (opts['asar-unpack']) {
          asarOptions.unpack = opts['asar-unpack']
        }
        if (opts['asar-unpack-dir']) {
          asarOptions.unpackDir = opts['asar-unpack-dir']
        }
        asarApp(path.join(appPath), asarOptions, cb)
      })
    }

    series(operations, function (err) {
      if (err) return callback(err)
      // Resolve to path to temporary app folder for platform-specific processes to use
      callback(null, tempPath)
    })
  },

  moveApp: function finalizeApp (opts, tempPath, callback) {
    var finalPath = generateFinalPath(opts)

    if (opts.tmpdir === false) {
      callback(null, finalPath)
      return
    }

    fs.move(tempPath, finalPath, function (err) {
      callback(err, finalPath)
    })
  },

  normalizeExt: function normalizeExt (filename, targetExt, cb) {
    // Forces a filename to a given extension and fires the given callback with the normalized filename,
    // if it exists.  Otherwise reports the error from the fs.stat call.
    // (Used for resolving icon filenames, particularly during --all runs.)

    // This error path is used by win32.js if no icon is specified
    if (!filename) return cb(new Error('No filename specified to normalizeExt'))

    var ext = path.extname(filename)
    if (ext !== targetExt) {
      filename = filename.slice(0, filename.length - ext.length) + targetExt
    }

    fs.stat(filename, function (err) {
      cb(err, err ? null : filename)
    })
  }
}
