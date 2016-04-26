define(['exports', 'module', './handlebars/base', './handlebars/safe-string', './handlebars/exception', './handlebars/utils', './handlebars/runtime'], function (exports, module, _handlebarsBase, _handlebarsSafeString, _handlebarsException, _handlebarsUtils, _handlebarsRuntime) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)

  var _SafeString = _interopRequire(_handlebarsSafeString);

  var _Exception = _interopRequire(_handlebarsException);

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  function create() {
    var hb = new _handlebarsBase.HandlebarsEnvironment();

    _handlebarsUtils.extend(hb, _handlebarsBase);
    hb.SafeString = _SafeString;
    hb.Exception = _Exception;
    hb.Utils = _handlebarsUtils;
    hb.escapeExpression = _handlebarsUtils.escapeExpression;

    hb.VM = _handlebarsRuntime;
    hb.template = function (spec) {
      return _handlebarsRuntime.template(spec, hb);
    };

    return hb;
  }

  var Handlebars = create();
  Handlebars.create = create;

  /*jshint -W040 */
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };

  Handlebars['default'] = Handlebars;

  module.exports = Handlebars;
});
/*global window */