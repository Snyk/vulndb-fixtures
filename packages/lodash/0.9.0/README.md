# Lo-Dash v0.9.0

A utility library delivering consistency, [customization](http://lodash.com/custom-builds), [performance](http://lodash.com/benchmarks), & [extras](http://lodash.com/#features).

## Download

 * [Development build](https://raw.github.com/lodash/lodash/0.9.0/lodash.js)
 * [Production build](https://raw.github.com/lodash/lodash/0.9.0/lodash.min.js)
 * [Underscore build](https://raw.github.com/lodash/lodash/0.9.0/lodash.underscore.min.js) tailored for projects already using Underscore
 * CDN copies of ≤ [v0.9.0](http://cdnjs.cloudflare.com/ajax/libs/lodash.js/0.9.0/lodash.min.js) are available on [cdnjs](http://cdnjs.com/) thanks to [CloudFlare](http://www.cloudflare.com/)
 * For optimal file size, [create a custom build](http://lodash.com/custom-builds) with only the features you need

## Dive in

We’ve got [API docs](http://lodash.com/docs), [benchmarks](http://lodash.com/benchmarks), and [unit tests](http://lodash.com/tests).

Create your own benchmarks at [jsPerf](http://jsperf.com), or [search](http://jsperf.com/search?q=lodash) for existing ones.

For a list of upcoming features, check out our [roadmap](https://github.com/lodash/lodash/wiki/Roadmap).

## Screencasts

For more information check out these screencasts over Lo-Dash:

 * [Introducing Lo-Dash](https://vimeo.com/44154599)
 * [Lo-Dash optimizations and custom builds](https://vimeo.com/44154601)
 * [Lo-Dash’s origin and why it’s a better utility belt](https://vimeo.com/44154600)
 * [Unit testing in Lo-Dash](https://vimeo.com/45865290)
 * [Lo-Dash’s approach to native method use](https://vimeo.com/48576012)

## Features

 * AMD loader support ([RequireJS](http://requirejs.org/), [curl.js](https://github.com/cujojs/curl), etc.)
 * [_.clone](http://lodash.com/docs#clone) supports *“deep”* cloning
 * [_.forEach](http://lodash.com/docs#forEach) is chainable and supports exiting iteration early
 * [_.forIn](http://lodash.com/docs#forIn) for iterating over an object’s own and inherited properties
 * [_.forOwn](http://lodash.com/docs#forOwn) for iterating over an object’s own properties
 * [_.isPlainObject](http://lodash.com/docs#isPlainObject) checks if values are created by the `Object` constructor
 * [_.lateBind](http://lodash.com/docs#lateBind) for late binding
 * [_.merge](http://lodash.com/docs#merge) for a *“deep”* [_.extend](http://lodash.com/docs#extend)
 * [_.partial](http://lodash.com/docs#partial) for partial application without `this` binding
 * [_.pick](http://lodash.com/docs#pick) and [_.omit](http://lodash.com/docs#omit) accept `callback` and `thisArg` arguments
 * [_.template](http://lodash.com/docs#template) utilizes [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl) for easier debugging
 * [_.contains](http://lodash.com/docs#contains), [_.size](http://lodash.com/docs#size), [_.toArray](http://lodash.com/docs#toArray),
   [and more…](http://lodash.com/docs "_.countBy, _.every, _.filter, _.find, _.forEach, _.groupBy, _.invoke, _.map, _.pluck, _.reduce, _.reduceRight, _.reject, _.some, _.sortBy, _.where") accept strings

## Support

Lo-Dash has been tested in at least Chrome 5~22, Firefox 1~16, IE 6-10, Opera 9.25-12, Safari 3-6, Node.js 0.4.8-0.8.12, Narwhal 0.3.2, RingoJS 0.8, and Rhino 1.7RC5.

## Installation and usage

In browsers:

```html
<script src="lodash.js"></script>
```

Using [npm](http://npmjs.org/):

```bash
npm install lodash

npm install -g lodash
npm link lodash
```

In [Node.js](http://nodejs.org/) and [RingoJS v0.8.0+](http://ringojs.org/):

```js
var _ = require('lodash');
```

**Note:** If Lo-Dash is installed globally, [run `npm link lodash`](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) in your project’s root directory before requiring it.

In [RingoJS v0.7.0-](http://ringojs.org/):

```js
var _ = require('lodash')._;
```

In [Rhino](http://www.mozilla.org/rhino/):

```js
load('lodash.js');
```

In an AMD loader like [RequireJS](http://requirejs.org/):

```js
require({
  'paths': {
    'underscore': 'path/to/lodash'
  }
},
['underscore'], function(_) {
  console.log(_.VERSION);
});
```

## Resolved Underscore.js issues

 * Add AMD loader support [[#431](https://github.com/documentcloud/underscore/pull/431), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L116-138)]
 * Allow iteration of objects with a `length` property [[#799](https://github.com/documentcloud/underscore/pull/799), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L508-514)]
 * Ensure *“Collections”* methods allow string `collection` arguments [[#247](https://github.com/documentcloud/underscore/issues/247), [#276](https://github.com/documentcloud/underscore/issues/276), [#561](https://github.com/documentcloud/underscore/pull/561), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L468-485)]
 * Fix cross-browser object iteration bugs [[#60](https://github.com/documentcloud/underscore/issues/60), [#376](https://github.com/documentcloud/underscore/issues/376), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L521-545)]
 * Methods should work on pages with incorrectly shimmed native methods [[#7](https://github.com/documentcloud/underscore/issues/7), [#742](https://github.com/documentcloud/underscore/issues/742), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L140-146)]
 * `_.clone` should allow `deep` cloning [[#595](https://github.com/documentcloud/underscore/pull/595), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L212-223)]
 * `_.contains` should work with strings [[#667](https://github.com/documentcloud/underscore/pull/667), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L265-274)]
 * `_.extend` should recursively extend objects [[#379](https://github.com/documentcloud/underscore/pull/379), [#718](https://github.com/documentcloud/underscore/issues/718), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L989-1011)]
 * `_.forEach` should be chainable [[#142](https://github.com/documentcloud/underscore/issues/142), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L463-466)]
 * `_.forEach` should allow exiting iteration early [[#211](https://github.com/documentcloud/underscore/issues/211), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L551-569)]
 * `_.isEmpty` should support jQuery/MooTools DOM query collections [[#690](https://github.com/documentcloud/underscore/pull/690), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L710-715)]
 * `_.isObject` should avoid V8 bug [#2291](http://code.google.com/p/8/issues/detail?id=2291) [[#605](https://github.com/documentcloud/underscore/issues/605), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L770-782)]
 * `_.keys` should work with `arguments` objects cross-browser [[#396](https://github.com/documentcloud/underscore/issues/396), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L863-865)]
 * `_.range` should coerce arguments to numbers [[#634](https://github.com/documentcloud/underscore/issues/634), [#683](https://github.com/documentcloud/underscore/issues/683), [test](https://github.com/lodash/lodash/blob/0.9.0/test/test.js#L1264-1267)]

## Release Notes

### <sup>v0.9.0</sup>

 * Added a `sourceURL` option to `_.template`
 * Ensured `_.where` returns an empty array if passed an empty `properties` object
 * Expanded `_.isFinite` to return `true` for numeric strings
 * Reduced `_.intersection`, `_.omit`, `_.pick`, `_.sortedIndex`, and `_.where`
 * Reduced the `npm` package file size by only downloading the minifiers for global installs
 * Reduced Lo-Dash's file size
 * Removed compilation from `_.bindAll`, `_.contains`, `_.countBy`, `_.every`,
   `_.filter`, `_.find`, `_.functions`, `_.groupBy`, `_.invert`, `_.invoke`,
   `_.isEmpty`, `_.map`, `_.merge`, `_.omit`, `_.pairs`, `_.pick`, `_.pluck`,
   `_.reduce`, `_.reject`, `_.some`, `_.sortBy`, `_.values`, `_.where`, and
   internal `shimKeys`

The full changelog is available [here](https://github.com/lodash/lodash/wiki/Changelog).

## BestieJS

Lo-Dash is part of the [BestieJS](https://github.com/bestiejs)  *“Best in Class”* module collection. This means we promote solid browser/environment support, ES5 precedents, unit testing, and plenty of documentation.

## Author

| [![twitter/jdalton](http://gravatar.com/avatar/299a3d891ff1920b69c364d061007043?s=70)](http://twitter.com/jdalton "Follow @jdalton on Twitter") |
|---|
| [John-David Dalton](http://allyoucanleet.com/) |

## Contributors

| [![twitter/blainebublitz](http://gravatar.com/avatar/ac1c67fd906c9fecd823ce302283b4c1?s=70)](http://twitter.com/blainebublitz "Follow @BlaineBublitz on Twitter") | [![twitter/kitcambridge](http://gravatar.com/avatar/6662a1d02f351b5ef2f8b4d815804661?s=70)](https://twitter.com/kitcambridge "Follow @kitcambridge on Twitter") | [![twitter/mathias](http://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](http://twitter.com/mathias "Follow @mathias on Twitter") |
|---|---|---|
| [Blaine Bublitz](http://iceddev.com/) | [Kit Cambridge](http://kitcambridge.github.io/) | [Mathias Bynens](http://mathiasbynens.be/) |
