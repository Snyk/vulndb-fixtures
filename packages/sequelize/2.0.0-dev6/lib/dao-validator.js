var Validator = require("validator")
  , Utils     = require("./utils")
  , sequelizeError = require("./errors")

var DaoValidator = module.exports = function(modelInstance, options) {
  options = options || {}
  options.skip = options.skip || []

  this.modelInstance   = modelInstance
  this.chainer = new Utils.QueryChainer()
  this.options = options
}

/** @define {string} The error key for arguments as passed by custom validators */
DaoValidator.RAW_KEY_NAME = '__raw'

DaoValidator.prototype.validate = function() {
  var self = this

  return new Utils.CustomEventEmitter(function(emitter) {
    validateAttributes.call(self)
    validateModel.call(self)

    self
      .chainer
      .run()
      .success(function () {
        emitter.emit('success')
      })
      .error(function(err) {
        var error = new sequelizeError.ValidationError('Validation error')
        error[DaoValidator.RAW_KEY_NAME] = []

        Utils._.each(err, function (value) {
          error[DaoValidator.RAW_KEY_NAME].push(value[DaoValidator.RAW_KEY_NAME])
          delete value[DaoValidator.RAW_KEY_NAME]
          Utils._.extend(error, value)
        })

        emitter.emit('success', error)
      })
  }).run()
}

DaoValidator.prototype.hookValidate = function() {
  var self   = this

  return new Utils.CustomEventEmitter(function(emitter) {
    self.modelInstance.Model.runHooks('beforeValidate', self.modelInstance, function(err) {
      if (!!err) {
        return emitter.emit('error', err)
      }

      self.validate().success(function (error) {
        if (!!error) {
          return emitter.emit('error', error)
        }

        self.modelInstance.Model.runHooks('afterValidate', self.modelInstance, function(err) {
          if (!!err) {
            return emitter.emit('error', err)
          }

          emitter.emit('success', self.modelInstance)
        })
      })
    })
  }).run()
}

// private
var validateModel = function() {
  Utils._.each(this.modelInstance.__options.validate, function(_validator, validatorType) {
    var validator = prepareValidationOfAttribute.call(this, undefined, _validator, validatorType, { omitValue: true })

    this.chainer.add(new Utils.CustomEventEmitter(function(emitter) {
      var next = function(err) {

        if (err) {
          var error = {};
          error[DaoValidator.RAW_KEY_NAME] = err

          var msg = ((err instanceof Error) ? err.message : err)
          error[validatorType] = [msg]
          emitter.emit('error', error)
        } else {
          emitter.emit('success')
        }
      }

      validator.args.unshift(next);
      validator.fn.apply(null, validator.args)
    }.bind(this)).run())
  }.bind(this))
}

var validateAttributes = function() {
  var self   = this
    , errors = {}

  Utils._.each(this.modelInstance.rawAttributes, function(rawAttribute, field) {
    var value          = self.modelInstance.dataValues[field]
      , hasAllowedNull = ((rawAttribute === undefined || rawAttribute.allowNull === true) && ((value === null) || (value === undefined)))
      , isSkipped      = self.options.skip.length > 0 && self.options.skip.indexOf(field) !== -1

    if (self.modelInstance.validators.hasOwnProperty(field) && !hasAllowedNull && !isSkipped) {
      errors = Utils._.merge(errors, validateAttribute.call(self, value, field))
    }
  })

  return errors
}

var validateAttribute = function(value, field) {
  // for each validator
  Utils._.each(this.modelInstance.validators[field], function(details, validatorType) {
    var validator = prepareValidationOfAttribute.call(this, value, details, validatorType)

    this.chainer.add(new Utils.CustomEventEmitter(function(emitter) {
      var next = function(err) {
        if (err) {
          var error = {}
          error[field] = [err]
          emitter.emit('error', error)
        } else {
          emitter.emit('success')
        }
      }

      validator.args.unshift(next);
      validator.fn.apply(null, validator.args)
    }.bind(this)).run())
  }.bind(this)) // for each validator for this field
}

var prepareValidationOfAttribute = function(value, details, validatorType, options) {
  var isCustomValidator = false // if true then it's a custom validation method
    , validatorFunction = null  // the validation function to call
    , validatorArgs     = []    // extra arguments to pass to validation function
    , errorMessage      = ""    // the error message to return if validation fails

  if (typeof details === 'function') {
    // it is a custom validator function?
    isCustomValidator = true

    var callArgs = []
    var validatorArity = details.length

    var omitValue = !!(options || {}).omitValue
    if (!omitValue) {
      callArgs.push(value)
    }

    // check if validator is async and requires a callback
    var isAsync = omitValue && validatorArity === 1 ||
      !omitValue && validatorArity === 2

    validatorFunction = function(next) {
      if (isAsync) {
        callArgs.push(next)
      }

      try {
        details.apply(this.modelInstance, callArgs)
      } catch(ex) {
        return next(ex)
      }

      if (!isAsync) {
        next()
      }
    }.bind(this)
  } else {
    // it is a validator module function?

    // extract extra arguments for the validator
    validatorArgs = details.hasOwnProperty("args") ? details.args : details

    if (!Array.isArray(validatorArgs)) {
      validatorArgs = [validatorArgs]
    } else {
      validatorArgs = validatorArgs.slice(0);
    }

    // extract the error msg
    errorMessage = details.hasOwnProperty("msg") ? details.msg : undefined

    // check method exists
    var validator = Validator.check(value, errorMessage)

    // check if Validator knows that kind of validation test
    if (!Utils._.isFunction(validator[validatorType])) {
      throw new Error("Invalid validator function: " + validatorType)
    }

    // bind to validator obj
    validatorFunction = function(next) {
      var args = Array.prototype.slice.call(arguments, 1)

      try {
        validator[validatorType].apply(validator, args)
        next()
      } catch (err) {
        next(err.message)
      }
    }
  }

  return {
    fn:       validatorFunction,
    msg:      errorMessage,
    args:     validatorArgs,
    isCustom: isCustomValidator
  }
}

