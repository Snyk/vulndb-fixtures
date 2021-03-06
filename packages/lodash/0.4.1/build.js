#!/usr/bin/env node
;(function() {
  'use strict';

  /** Load modules */
  var fs = require('fs'),
      path = require('path'),
      vm = require('vm'),
      minify = require(path.join(__dirname, 'build', 'minify'));

  /** The current working directory */
  var cwd = process.cwd();

  /** Flag used to specify a backbone build */
  var isBackbone = process.argv.indexOf('backbone') > -1;

  /** Flag used to specify a legacy build */
  var isLegacy = process.argv.indexOf('legacy') > -1;

  /** Flag used to specify a mobile build */
  var isMobile = !isLegacy && process.argv.indexOf('mobile') > -1;

  /** Shortcut used to convert array-like objects to arrays */
  var slice = [].slice;

  /** The lodash.js source */
  var source = fs.readFileSync(path.join(__dirname, 'lodash.js'), 'utf8');

  /** Load customized Lo-Dash module */
  var lodash = (function() {
    var sandbox = {};

    if (isLegacy) {
      ['isBindFast', 'isKeysFast', 'nativeBind', 'nativeIsArray', 'nativeKeys'].forEach(function(varName) {
        source = replaceVar(source, varName, 'false');
      });
    }
    else if (isMobile) {
      source = replaceVar(source, 'isKeysFast', 'false');
    }
    vm.runInNewContext(source, sandbox);
    return sandbox._;
  }());

  /** Used to associate aliases with their real names */
  var aliasToRealMap = {
    'all': 'every',
    'any': 'some',
    'collect': 'map',
    'detect': 'find',
    'each': 'forEach',
    'foldl': 'reduce',
    'foldr': 'reduceRight',
    'head': 'first',
    'include': 'contains',
    'inject': 'reduce',
    'methods': 'functions',
    'select': 'filter',
    'tail': 'rest',
    'take': 'first',
    'unique': 'uniq'
  };

  /** Used to associate real names with their aliases */
  var realToAliasMap = {
    'contains': ['include'],
    'every': ['all'],
    'filter': ['select'],
    'find': ['detect'],
    'first': ['head', 'take'],
    'forEach': ['each'],
    'functions': ['methods'],
    'map': ['collect'],
    'reduce': ['foldl', 'inject'],
    'reduceRight': ['foldr'],
    'rest': ['tail'],
    'some': ['any'],
    'uniq': ['unique']
  };

  /** Used to track Backbone's Lo-Dash dependencies */
  var backboneDependencies = [
    'bind',
    'bindAll',
    'clone',
    'contains',
    'escape',
    'every',
    'extend',
    'filter',
    'find',
    'first',
    'forEach',
    'groupBy',
    'has',
    'indexOf',
    'initial',
    'invoke',
    'isArray',
    'isEmpty',
    'isEqual',
    'isFunction',
    'isObject',
    'isRegExp',
    'keys',
    'last',
    'lastIndexOf',
    'map',
    'max',
    'min',
    'mixin',
    'reduce',
    'reduceRight',
    'reject',
    'rest',
    'shuffle',
    'size',
    'some',
    'sortBy',
    'sortedIndex',
    'toArray',
    'uniqueId',
    'without'
  ];

  /** Used to track function dependencies */
  var dependencyMap = {
    'after': [],
    'bind': [],
    'bindAll': ['bind', 'functions'],
    'chain': ['mixin'],
    'clone': ['extend', 'isArray'],
    'compact': [],
    'compose': [],
    'contains': [],
    'debounce': [],
    'defaults': [],
    'defer': [],
    'delay': [],
    'difference': ['indexOf'],
    'escape': [],
    'every': ['identity'],
    'extend': [],
    'filter': ['identity'],
    'find': [],
    'first': [],
    'flatten': ['isArray'],
    'forEach': [],
    'forIn': [],
    'forOwn': [],
    'functions': [],
    'groupBy': [],
    'has': [],
    'identity': [],
    'indexOf': ['sortedIndex'],
    'initial': [],
    'intersection': ['every', 'indexOf'],
    'invoke': [],
    'isArguments': [],
    'isArray': [],
    'isBoolean': [],
    'isDate': [],
    'isElement': [],
    'isEmpty': [],
    'isEqual': [],
    'isFinite': [],
    'isFunction': [],
    'isNaN': [],
    'isNull': [],
    'isNumber': [],
    'isObject': [],
    'isRegExp': [],
    'isString': [],
    'isUndefined': [],
    'keys': [],
    'last': [],
    'lastIndexOf': [],
    'map': ['identity'],
    'max': [],
    'memoize': [],
    'min': [],
    'mixin': ['forEach', 'functions'],
    'noConflict': [],
    'once': [],
    'partial': [],
    'pick': [],
    'pluck': [],
    'range': [],
    'reduce': [],
    'reduceRight': ['keys'],
    'reject': ['identity'],
    'rest': [],
    'result': [],
    'shuffle': [],
    'size': ['keys'],
    'some': ['identity'],
    'sortBy': [],
    'sortedIndex': ['bind'],
    'tap': [],
    'template': ['escape'],
    'throttle': [],
    'times': [],
    'toArray': ['values'],
    'union': ['indexOf'],
    'uniq': ['identity', 'indexOf'],
    'uniqueId': [],
    'values': [],
    'without': ['indexOf'],
    'wrap': [],
    'zip': ['max', 'pluck'],
    'zipObject': []
  };

  /** Used to `iteratorTemplate` */
  var iteratorOptions = [
    'args',
    'array',
    'arrayBranch',
    'beforeLoop',
    'bottom',
    'exit',
    'firstArg',
    'hasDontEnumBug',
    'inLoop',
    'init',
    'isKeysFast',
    'iteratee',
    'object',
    'objectBranch',
    'noCharByIndex',
    'shadowed',
    'top',
    'useHas'
  ];

  /** Collections of method names */
  var excludeMethods,
      includeMethods,
      allMethods = Object.keys(dependencyMap);

  /** Used to specify whether filtering is for exclusion or inclusion */
  var filterType = process.argv.reduce(function(result, value) {
    if (result) {
      return result;
    }
    var pair = value.match(/^(exclude|include)=(.*)$/);
    if (!pair) {
      return result;
    }
    // remove nonexistent method names
    var methodNames = lodash.intersection(allMethods, pair[2].split(/, */).map(getRealName));

    if (pair[1] == 'exclude') {
      excludeMethods = methodNames;
    } else {
      includeMethods = methodNames;
    }
    // return `filterType`
    return pair[1];
  }, '');

  /*--------------------------------------------------------------------------*/

  /**
   * Gets the aliases associated with a given function name.
   *
   * @private
   * @param {String} funcName The name of the function to get aliases for.
   * @returns {Array} Returns an array of aliases.
   */
  function getAliases(funcName) {
    return realToAliasMap[funcName] || [];
  }

  /**
   * Gets an array of depenants for a function by a given name.
   *
   * @private
   * @param {String} funcName The name of the function to query.
   * @returns {Array} Returns an array of function dependants.
   */
  function getDependants(funcName) {
    // iterate over `dependencyMap`, adding the names of functions that
    // have `funcName` as a dependency
    return lodash.reduce(dependencyMap, function(result, dependencies, otherName) {
      if (lodash.contains(dependencies, funcName)) {
        result.push(otherName);
      }
      return result;
    }, []);
  }

  /**
   * Gets an array of dependencies for a given function name. If passed an array
   * of dependencies it will return an array containing the given dependencies
   * plus any additional detected sub-dependencies.
   *
   * @private
   * @param {Array|String} funcName A single function name or array of
   *  dependencies to query.
   * @returns {Array} Returns an array of function dependencies.
   */
  function getDependencies(funcName) {
    var dependencies = Array.isArray(funcName) ? funcName : dependencyMap[funcName];
    if (!dependencies) {
      return [];
    }
    // recursively accumulate the dependencies of the `funcName` function, and
    // the dependencies of its dependencies, and so on.
    return lodash.uniq(dependencies.reduce(function(result, otherName) {
      result.push.apply(result, getDependencies(otherName).concat(otherName));
      return result;
    }, []));
  }

  /**
   * Gets the formatted source of the given function.
   *
   * @private
   * @param {Function} func The function to process.
   * @returns {String} Returns the formatted source.
   */
  function getFunctionSource(func) {
    var source = func.source || (func + '');

    // all leading whitespace
    return source.replace(/\n(?:.*)/g, function(match, index) {
      match = match.slice(1);
      return (
        match == '}' && source.indexOf('}', index + 2) == -1 ? '\n  ' : '\n    '
      ) + match;
    });
  }

  /**
   * Gets the `_.isArguments` fallback snippet from `source`.
   *
   * @private
   * @param {String} source The source to inspect.
   * @returns {String} Returns the `isArguments` fallback snippet.
   */
  function getIsArgumentsFallback(source) {
    return (source.match(/(?:\s*\/\/.*)*\s*if *\(!(?:lodash\.)?isArguments[^)]+\)[\s\S]+?};\s*}/) || [''])[0];
  }

  /**
   * Gets the real name, not alias, of a given function name.
   *
   * @private
   * @param {String} funcName The name of the function to resolve.
   * @returns {String} Returns the real name.
   */
  function getRealName(funcName) {
    return aliasToRealMap[funcName] || funcName;
  }

  /**
   * Determines if all functions of the given names have been removed from `source`.
   *
   * @private
   * @param {String} source The source to inspect.
   * @param {String} [funcName1, funcName2, ...] The names of functions to check.
   * @returns {Boolean} Returns `true` if all functions have been removed, else `false`.
   */
  function isRemoved(source) {
    return slice.call(arguments, 1).every(function(funcName) {
      return !matchFunction(source, funcName);
    });
  }

  /**
   * Searches `source` for a `funcName` function declaration, expression, or
   * assignment and returns the matched snippet.
   *
   * @private
   * @param {String} source The source to inspect.
   * @param {String} funcName The name of the function to match.
   * @returns {String} Returns the matched function snippet.
   */
  function matchFunction(source, funcName) {
    var result = source.match(RegExp(
      // match multi-line comment block (could be on a single line)
      '\\n +/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/\\n' +
      // begin non-capturing group
      '(?:' +
      // match a function declaration
      '( +)function ' + funcName + '\\b[\\s\\S]+?\\n\\1}|' +
      // match a variable declaration with `createIterator`
      ' +var ' + funcName + ' *=.*?createIterator\\((?:{|[a-zA-Z])[\\s\\S]+?\\);|' +
      // match a variable declaration with function expression
      '( +)var ' + funcName + ' *=.*?function[\\s\\S]+?\\n\\2};' +
      // end non-capturing group
      ')\\n'
    ));

    return result ? result[0] : '';
  }

  /**
   * Removes the all references to `refName` from `createIterator` in `source`.
   *
   * @private
   * @param {String} source The source to process.
   * @param {String} refName The name of the reference to remove.
   * @returns {String} Returns the modified source.
   */
  function removeFromCreateIterator(source, refName) {
    var snippet = matchFunction(source, 'createIterator');
    if (snippet) {
      // clip the snippet the `factory` assignment
      snippet = snippet.match(/Function\([\s\S]+$/)[0];
      var modified = snippet.replace(RegExp('\\b' + refName + '\\b,? *', 'g'), '');
      source = source.replace(snippet, modified);
    }
    return source;
  }

  /**
   * Removes the `funcName` function declaration, expression, or assignment and
   * associated code from `source`.
   *
   * @private
   * @param {String} source The source to process.
   * @param {String} funcName The name of the function to remove.
   * @returns {String} Returns the source with the function removed.
   */
  function removeFunction(source, funcName) {
    var modified,
        snippet = matchFunction(source, funcName);

    // exit early if function is not found
    if (!snippet) {
      return source;
    }
    // remove function
    source = source.replace(matchFunction(source, funcName), '');

    // grab the method assignments snippet
    snippet = source.match(/lodash\.VERSION *= *[\s\S]+?\/\*-+\*\/\n/)[0];

    // remove assignment and aliases
    modified = getAliases(funcName).concat(funcName).reduce(function(result, otherName) {
      return result.replace(RegExp('(?:\\n *//.*\\s*)* *lodash\\.' + otherName + ' *= *.+\\n'), '');
    }, snippet);

    // replace with the modified snippet
    source = source.replace(snippet, modified);

    return removeFromCreateIterator(source, funcName);
  }

  /**
   * Removes the `_.isArguments` fallback from `source`.
   *
   * @private
   * @param {String} source The source to process.
   * @returns {String} Returns the source with the `isArguments` fallback removed.
   */
  function removeIsArgumentsFallback(source) {
    return source.replace(getIsArgumentsFallback(source), '');
  }

  /**
   * Removes the `Object.keys` object iteration optimization from `source`.
   *
   * @private
   * @param {String} source The source to process.
   * @returns {String} Returns the modified source.
   */
  function removeKeysOptimization(source) {
    return removeVar(source, 'isKeysFast')
      // remove `isKeysFast` from `beforeLoop.object` of `mapIteratorOptions`
      .replace(/=\s*'\s*\+\s*\(isKeysFast.+/, "= []'")
      // remove `isKeysFast` from `inLoop.object` of `mapIteratorOptions`, `invoke`, `pluck`, and `sortBy`
      .replace(/'\s*\+\s*\(isKeysFast[^)]+?\)\s*\+\s*'/g, '.push')
      // remove data object property assignment in `createIterator`
      .replace(/\s*.+?\.isKeysFast *=.+/, '')
      // remove optimized branch in `iteratorTemplate`
      .replace(/(?: *\/\/.*\n)*\s*'( *)<% *if *\(isKeysFast[\s\S]+?'\1<% *} *else *\{ *%>.+\n([\s\S]+?) *'\1<% *} *%>.+/, '$2');
  }

  /**
   * Removes a given variable from `source`.
   *
   * @private
   * @param {String} source The source to process.
   * @param {String} varName The name of the variable to remove.
   * @returns {String} Returns the source with the variable removed.
   */
  function removeVar(source, varName) {
    source = source.replace(RegExp(
      // begin non-capturing group
      '(?:' +
      // match multi-line comment block
      '(?:\\n +/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)?\\n' +
      // match a variable declaration that's not part of a declaration list
      '( +)var ' + varName + ' *= *(?:.+?;|(?:Function\\(.+?|.*?[^,])\\n[\\s\\S]+?\\n\\1.+?;)\\n|' +
      // match a variable in a declaration list
      '\\n +' + varName + ' *=.+?,' +
      // end non-capturing group
      ')'
    ), '');

    // remove a varaible at the start of a variable declaration list
    source = source.replace(RegExp('(var +)' + varName + ' *=.+?,\\s+'), '$1');

    // remove a variable at the end of a variable declaration list
    source = source.replace(RegExp(',\\s*' + varName + ' *=.+?;'), ';');

    return removeFromCreateIterator(source, varName);
  }

  /**
   * Searches `source` for a `varName` variable declaration and replaces its
   * assigned value with `varValue`.
   *
   * @private
   * @param {String} source The source to inspect.
   * @param {String} varName The name of the variable to replace.
   * @returns {String} Returns the source with the variable replaced.
   */
  function replaceVar(source, varName, varValue) {
    // replace a variable that's not part of a declaration list
    source = source.replace(RegExp(
      '(( +)var ' + varName + ' *= *)' +
      '(?:.+?;|(?:Function\\(.+?|.*?[^,])\\n[\\s\\S]+?\\n\\2.+?;)\\n'
    ), '$1' + varValue + ';\n');

    // replace a varaible at the start or middle of a declaration list
    source = source.replace(RegExp('((?:var|\\n) +' + varName + ' *=).+?,'), '$1 ' + varValue + ',');

    // replace a variable at the end of a variable declaration list
    source = source.replace(RegExp('(,\\s*' + varName + ' *=).+?;'), '$1 ' + varValue + ';');

    return source;
  }

  /*--------------------------------------------------------------------------*/

  // Backbone build
  if (isBackbone) {
    // add any additional sub-dependencies
    backboneDependencies = getDependencies(backboneDependencies);

    if (filterType == 'exclude') {
      // remove excluded methods from `backboneDependencies`
      includeMethods = lodash.without.apply(lodash, [backboneDependencies].concat(excludeMethods));
    }
    else if (filterType) {
      // merge backbone dependencies into `includeMethods`
      includeMethods = lodash.union(includeMethods, backboneDependencies);
    }
    else {
      // include only the Backbone dependencies
      includeMethods = backboneDependencies;
    }
    filterType = 'include';
  }

  /*--------------------------------------------------------------------------*/

  // add category methods
  process.argv.some(function(value) {
    var categories = value.match(/^category=(.*)$/);
    if (!categories) {
      return false;
    }
    // resolve method names belonging to each category
    var categoryMethods = categories.reduce(function(result, category) {
      return result.concat(allMethods.filter(function(funcName) {
        return RegExp('@category ' + category + '\\b', 'i').test(matchFunction(source, funcName));
      }));
    }, []);

    if (filterType == 'exclude') {
      // remove excluded methods from `categoryMethods`
      includeMethods = lodash.without.apply(lodash, [categoryMethods].concat(excludeMethods));
    }
    else if (filterType) {
      // merge `categoryMethods` into `includeMethods`
      includeMethods = lodash.union(includeMethods, categoryMethods);
    }
    else {
      // include only the `categoryMethods`
      includeMethods = categoryMethods;
    }
    filterType = 'include';
    return true;
  });

  /*--------------------------------------------------------------------------*/

  // custom build
  (function() {
    // exit early if "exclude" or "include" options aren't specified
    if (!filterType) {
      return;
    }
    if (filterType == 'exclude') {
      // remove methods that are named in `excludeMethods` and their dependants
      excludeMethods.forEach(function(funcName) {
        getDependants(funcName).concat(funcName).forEach(function(otherName) {
          source = removeFunction(source, otherName);
        });
      });
    }
    else {
      // add dependencies to `includeMethods`
      includeMethods = getDependencies(includeMethods);

      // remove methods that aren't named in `includeMethods`
      lodash.each(allMethods, function(otherName) {
        if (!lodash.contains(includeMethods, otherName)) {
          source = removeFunction(source, otherName);
        }
      });
    }

    // remove `isArguments` fallback before `isArguments` is transformed by
    // other parts of the build process
    if (isRemoved(source, 'isArguments')) {
      source = removeIsArgumentsFallback(source);
    }
  }());

  /*--------------------------------------------------------------------------*/

  // simplify template snippets
  source = source.replace(
    RegExp(
      "'else if \\(thisArg\\) \\{\\\\n' \\+\\s*" +
      "'  callback = iteratorBind\\(callback, thisArg\\)\\\\n' \\+\\s*" +
      "'}'"
    , 'g'),
    "'else if (thisArg) callback = iteratorBind(callback, thisArg)'"
  );

  /*--------------------------------------------------------------------------*/

  // DRY out isType functions
  (function() {
    var iteratorName = lodash.find(['forEach', 'forOwn'], function(funcName) {
      return !isRemoved(source, funcName);
    });

    // skip this optimization if there are no iteration methods to use
    if (!iteratorName) {
      return;
    }
    var snippet,
        funcNames = [],
        objectSnippets = [],
        token = '__isTypeToken__';

    // build replacement code
    lodash.forOwn({
      'Arguments': "'[object Arguments]'",
      'Date': 'dateClass',
      'Function': 'funcClass',
      'Number': 'numberClass',
      'RegExp': 'regexpClass',
      'String': 'stringClass'
    }, function(value, key) {
      // skip `isArguments` if a legacy build
      if (isLegacy && key == 'Arguments') {
        return;
      }
      var funcName = 'is' + key,
          funcCode = matchFunction(source, funcName);

      if (funcCode) {
        if (!snippet) {
          // use snippet to mark the insert position
          snippet = funcCode;
        }
        funcNames.push(funcName);
        objectSnippets.push("'" + key + "': " + value);
      }
    });

    // skip this optimization if there are less than 2 isType functions
    if (funcNames.length < 2) {
      return;
    }
    // add a token to mark the position to insert new code
    source = source.replace(snippet, '\n' + token + '\n' + snippet);

    // remove existing isType functions
    funcNames.forEach(function(funcName) {
      source = removeFunction(source, funcName);
    });

    // replace token with new DRY code
    source = source.replace(token,
      '  // add `_.' + funcNames.join('`, `_.') + '`\n' +
      '  ' + iteratorName + '({\n    ' + objectSnippets.join(',\n    ') + '\n  }, function(className, key) {\n' +
      "    lodash['is' + key] = function(value) {\n" +
      '      return toString.call(value) == className;\n' +
      '    };\n' +
      '  });'
    );

    // tweak `isArguments` fallback
    snippet = !isLegacy && getIsArgumentsFallback(source);
    if (snippet) {
      var modified = '\n' + snippet.replace(/isArguments/g, 'lodash.$&');
      source = source.replace(snippet, modified);
    }
  }());

  /*--------------------------------------------------------------------------*/

  if (isLegacy) {
    ['isBindFast', 'nativeBind', 'nativeIsArray', 'nativeKeys'].forEach(function(varName) {
      source = removeVar(source, varName);
    });

    ['bind', 'isArray'].forEach(function(funcName) {
      var snippet = matchFunction(source, funcName),
          modified = snippet;

      // remove native `Function#bind` branch in `_.bind`
      if (funcName == 'bind' ) {
        modified = modified.replace(/(?:\s*\/\/.*)*\s*else if *\(isBindFast[^}]+}/, '');
      }
      // remove native `Array.isArray` branch in `_.isArray`
      else if (funcName == 'isArray') {
        modified = modified.replace(/nativeIsArray * \|\|/, '');
      }
      source = source.replace(snippet, modified);
    });

    // replace `_.keys` with `shimKeys`
    if (!isRemoved(source, 'keys')) {
      source = source.replace(
        matchFunction(source, 'keys').replace(/[\s\S]+?var keys *=/, ''),
        matchFunction(source, 'shimKeys').replace(/[\s\S]+?var shimKeys *=/, '')
      );

      source = removeFunction(source, 'shimKeys');
    }
    // replace `_.isArguments` with fallback
    if (!isRemoved(source, 'isArguments')) {
      source = source.replace(
        matchFunction(source, 'isArguments').replace(/[\s\S]+?var isArguments *=/, ''),
        getIsArgumentsFallback(source).match(/isArguments *=([\s\S]+?) *};/)[1] + '  };\n'
      );

      source = removeIsArgumentsFallback(source);
    }

    source = removeVar(source, 'reNative');
    source = removeFromCreateIterator(source, 'nativeKeys');
    source = removeKeysOptimization(source);
  }

  if (isMobile) {
    // inline all functions defined with `createIterator`
    lodash.functions(lodash).forEach(function(funcName) {
      // match `funcName` with pseudo private `_` prefixes removed to allow matching `shimKeys`
      var reFunc = RegExp('(\\bvar ' + funcName.replace(/^_/, '') + ' *= *)createIterator\\(((?:{|[a-zA-Z])[\\s\\S]+?)\\);\\n');

      // skip if not defined with `createIterator`
      if (!reFunc.test(source)) {
        return;
      }
      // extract, format, and inject the compiled function's source code
      source = source.replace(reFunc, '$1' + getFunctionSource(lodash[funcName]) + ';\n');
    });

    // remove JScript [[DontEnum]] fix from `_.isEqual`
    source = source.replace(/(?:\s*\/\/.*)*\n( +)if *\(result *&& *hasDontEnumBug[\s\S]+?\n\1}/, '');

    // remove IE `shift` and `splice` fix from mutator Array functions mixin
    source = source.replace(/(?:\s*\/\/.*)*\n( +)if *\(value.length *=== *0[\s\S]+?\n\1}/, '');

    // remove `noCharByIndex` from `_.reduceRight`
    source = source.replace(/noCharByIndex *&&[^:]+: *([^;]+)/g, '$1');

    // remove `noArraySliceOnStrings` from `_.toArray`
    source = source.replace(/noArraySliceOnStrings *\?[^:]+: *([^)]+)/g, '$1');

    source = removeVar(source, 'extendIteratorOptions');
    source = removeVar(source, 'hasDontEnumBug');
    source = removeVar(source, 'iteratorTemplate');
    source = removeVar(source, 'noArraySliceOnStrings');
    source = removeVar(source, 'noCharByIndex');
    source = removeIsArgumentsFallback(source);
    source = removeKeysOptimization(source);
  }
  else {
    // inline `iteratorTemplate` template
    source = source.replace(/(( +)var iteratorTemplate *= *)[\s\S]+?\n\2.+?;\n/, (function() {
      var snippet = getFunctionSource(lodash._iteratorTemplate);

      // prepend data object references to property names to avoid having to
      // use a with-statement
      iteratorOptions.forEach(function(property) {
        if (property == 'iteratee') {
          // use a more fine-grained regexp for the `iteratee` property because
          // it's a compiled variable as well as a data property
          snippet = snippet.replace(/(__t *= *\( *)(iteratee)/, '$1obj.$2');
        } else {
          snippet = snippet.replace(RegExp('([^\\w.])\\b' + property + '\\b', 'g'), '$1obj.' + property);
        }
      });

      // remove unnecessary code
      snippet = snippet
        .replace(/var __t.+/, "var __p = '';")
        .replace(/function print[^}]+}/, '')
        .replace(/'(?:\\n|\s)+'/g, "''")
        .replace(/__p *\+= *' *';/g, '')
        .replace(/(__p *\+= *)' *' *\+/g, '$1')
        .replace(/(\{) *;|; *(\})/g, '$1$2')
        .replace(/\(\(__t *= *\( *([^)]+) *\)\) *== *null *\? *'' *: *__t\)/g, '$1');

      // remove the with-statement
      snippet = snippet.replace(/ *with *\(.+?\) *{/, '\n').replace(/}([^}]*}[^}]*$)/, '$1');

      // minor cleanup
      snippet = snippet
        .replace(/obj *\|\| *\(obj *= *\{}\);/, '')
        .replace(/var __p = '';\s*__p \+=/, 'var __p =');

      // remove comments, including sourceURLs
      snippet = snippet.replace(/\s*\/\/.*(?:\n|$)/g, '');

      return '$1' + snippet + ';\n';
    }()));
  }

  /*--------------------------------------------------------------------------*/

  // remove associated functions, variables, and code snippets that the minifier may miss
  if (isRemoved(source, 'mixin')) {
    // remove `LoDash` constructor
    source = removeFunction(source, 'LoDash');
    // remove `LoDash` calls
    source = source.replace(/(?:new +LoDash(?!\()|(?:new +)?LoDash\([^)]*\));?/g, '');
    // remove `LoDash.prototype` additions
    source = source.replace(/(?:\s*\/\/.*)*\s*LoDash.prototype *=[\s\S]+?\/\*-+\*\//, '');
  }
  if (isRemoved(source, 'sortBy')) {
    source = removeFunction(source, 'compareAscending');
  }
  if (isRemoved(source, 'template')) {
    // remove `templateSettings` assignment
    source = source.replace(/(?:\n +\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/)?\n *lodash\.templateSettings[\s\S]+?};\n/, '');
  }
  if (isRemoved(source, 'toArray')) {
    source = removeVar(source, 'noArraySliceOnStrings');
  }
  if (isRemoved(source, 'isArray', 'isEmpty', 'isEqual', 'size')) {
    source = removeVar(source, 'arrayClass');
  }
  if (isRemoved(source, 'bind', 'functions', 'groupBy', 'invoke', 'isEqual', 'isFunction', 'result', 'sortBy', 'toArray')) {
    source = removeVar(source, 'funcClass');
  }
  if (isRemoved(source, 'bind')) {
    source = removeVar(source, 'nativeBind');
    source = removeVar(source, 'isBindFast');
  }
  if (isRemoved(source, 'isArray')) {
    source = removeVar(source, 'nativeIsArray');
  }
  if (isRemoved(source, 'keys')) {
    source = removeFunction(source, 'shimKeys');
  }
  if (isRemoved(source, 'clone', 'isObject', 'keys')) {
    source = removeVar(source, 'objectTypes');
  }
  if (isRemoved(source, 'bind', 'isArray', 'keys')) {
    source = removeVar(source, 'reNative');
  }
  if (isRemoved(source, 'isEmpty', 'isEqual', 'isString', 'size')) {
    source = removeVar(source, 'stringClass');
  }
  if ((source.match(/\bcreateIterator\b/g) || []).length < 2) {
    source = removeFunction(source, 'createIterator');
  }
  if (isRemoved(source, 'createIterator', 'extend', 'isEqual')) {
    source = removeVar(source, 'hasDontEnumBug');
  }
  if (isRemoved(source, 'createIterator', 'keys')) {
    source = removeVar(source, 'nativeKeys');
  }
  if (isRemoved(source, 'createIterator', 'reduceRight')) {
    source = removeVar(source, 'noCharByIndex');
  }

  // remove pseudo private properties
  source = source.replace(/(?:(?:\s*\/\/.*)*\s*lodash\._[^=]+=.+\n)+/g, '\n');

  // consolidate consecutive horizontal rule comment separators
  source = source.replace(/(?:\s*\/\*-+\*\/\s*){2,}/g, function(separators) {
    return separators.match(/^\s*/)[0] + separators.slice(separators.lastIndexOf('/*'));
  });

  // cleanup code
  source = source.replace(/^ *;\n/gm, '');

  // begin the minification process
  if (filterType || isBackbone || isLegacy || isMobile) {
    fs.writeFileSync(path.join(cwd, 'lodash.custom.js'), source);
    minify(source, 'lodash.custom.min', function(result) {
      fs.writeFileSync(path.join(cwd, 'lodash.custom.min.js'), result);
    });
  }
  else {
    minify(source, 'lodash.min', function(result) {
      fs.writeFileSync(path.join(cwd, 'lodash.min.js'), result);
    });
  }
}());
