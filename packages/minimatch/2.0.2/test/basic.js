// http://www.bashcookbook.com/bashinfo/source/bash-1.14.7/tests/glob-test
//
// TODO: Some of these tests do very bad things with backslashes, and will
// most likely fail badly on windows.  They should probably be skipped.

var tap = require("tap")
  , globalBefore = Object.keys(global)
  , mm = require("../")
  , files = [ "a", "b", "c", "d", "abc"
            , "abd", "abe", "bb", "bcd"
            , "ca", "cb", "dd", "de"
            , "bdir/", "bdir/cfile"]
  , next = files.concat([ "a-b", "aXb"
                        , ".x", ".y" ])


var patterns =
  [ "http://www.bashcookbook.com/bashinfo/source/bash-1.14.7/tests/glob-test"
  , ["a*", ["a", "abc", "abd", "abe"]]
  , ["X*", ["X*"], {nonull: true}]

  // allow null glob expansion
  , ["X*", []]

  // isaacs: Slightly different than bash/sh/ksh
  // \\* is not un-escaped to literal "*" in a failed match,
  // but it does make it get treated as a literal star
  , ["\\*", ["\\*"], {nonull: true}]
  , ["\\**", ["\\**"], {nonull: true}]
  , ["\\*\\*", ["\\*\\*"], {nonull: true}]

  , ["b*/", ["bdir/"]]
  , ["c*", ["c", "ca", "cb"]]
  , ["**", files]

  , ["\\.\\./*/", ["\\.\\./*/"], {nonull: true}]
  , ["s/\\..*//", ["s/\\..*//"], {nonull: true}]

  , "legendary larry crashes bashes"
  , ["/^root:/{s/^[^:]*:[^:]*:\([^:]*\).*$/\\1/"
    , ["/^root:/{s/^[^:]*:[^:]*:\([^:]*\).*$/\\1/"], {nonull: true}]
  , ["/^root:/{s/^[^:]*:[^:]*:\([^:]*\).*$/\1/"
    , ["/^root:/{s/^[^:]*:[^:]*:\([^:]*\).*$/\1/"], {nonull: true}]

  , "character classes"
  , ["[a-c]b*", ["abc", "abd", "abe", "bb", "cb"]]
  , ["[a-y]*[^c]", ["abd", "abe", "bb", "bcd",
     "bdir/", "ca", "cb", "dd", "de"]]
  , ["a*[^c]", ["abd", "abe"]]
  , function () { files.push("a-b", "aXb") }
  , ["a[X-]b", ["a-b", "aXb"]]
  , function () { files.push(".x", ".y") }
  , ["[^a-c]*", ["d", "dd", "de"]]
  , function () { files.push("a*b/", "a*b/ooo") }
  , ["a\\*b/*", ["a*b/ooo"]]
  , ["a\\*?/*", ["a*b/ooo"]]
  , ["*\\\\!*", [], {null: true}, ["echo !7"]]
  , ["*\\!*", ["echo !7"], null, ["echo !7"]]
  , ["*.\\*", ["r.*"], null, ["r.*"]]
  , ["a[b]c", ["abc"]]
  , ["a[\\b]c", ["abc"]]
  , ["a?c", ["abc"]]
  , ["a\\*c", [], {null: true}, ["abc"]]
  , ["", [""], { null: true }, [""]]

  , "http://www.opensource.apple.com/source/bash/bash-23/" +
    "bash/tests/glob-test"
  , function () { files.push("man/", "man/man1/", "man/man1/bash.1") }
  , ["*/man*/bash.*", ["man/man1/bash.1"]]
  , ["man/man1/bash.1", ["man/man1/bash.1"]]
  , ["a***c", ["abc"], null, ["abc"]]
  , ["a*****?c", ["abc"], null, ["abc"]]
  , ["?*****??", ["abc"], null, ["abc"]]
  , ["*****??", ["abc"], null, ["abc"]]
  , ["?*****?c", ["abc"], null, ["abc"]]
  , ["?***?****c", ["abc"], null, ["abc"]]
  , ["?***?****?", ["abc"], null, ["abc"]]
  , ["?***?****", ["abc"], null, ["abc"]]
  , ["*******c", ["abc"], null, ["abc"]]
  , ["*******?", ["abc"], null, ["abc"]]
  , ["a*cd**?**??k", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["a**?**cd**?**??k", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["a**?**cd**?**??k***", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["a**?**cd**?**??***k", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["a**?**cd**?**??***k**", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["a****c**?**??*****", ["abcdecdhjk"], null, ["abcdecdhjk"]]
  , ["[-abc]", ["-"], null, ["-"]]
  , ["[abc-]", ["-"], null, ["-"]]
  , ["\\", ["\\"], null, ["\\"]]
  , ["[\\\\]", ["\\"], null, ["\\"]]
  , ["[[]", ["["], null, ["["]]
  , ["[", ["["], null, ["["]]
  , ["[*", ["[abc"], null, ["[abc"]]
  , "a right bracket shall lose its special meaning and\n" +
    "represent itself in a bracket expression if it occurs\n" +
    "first in the list.  -- POSIX.2 2.8.3.2"
  , ["[]]", ["]"], null, ["]"]]
  , ["[]-]", ["]"], null, ["]"]]
  , ["[a-\z]", ["p"], null, ["p"]]
  , ["??**********?****?", [], { null: true }, ["abc"]]
  , ["??**********?****c", [], { null: true }, ["abc"]]
  , ["?************c****?****", [], { null: true }, ["abc"]]
  , ["*c*?**", [], { null: true }, ["abc"]]
  , ["a*****c*?**", [], { null: true }, ["abc"]]
  , ["a********???*******", [], { null: true }, ["abc"]]
  , ["[]", [], { null: true }, ["a"]]
  , ["[abc", [], { null: true }, ["["]]

  , "nocase tests"
  , ["XYZ", ["xYz"], { nocase: true, null: true }
    , ["xYz", "ABC", "IjK"]]
  , ["ab*", ["ABC"], { nocase: true, null: true }
    , ["xYz", "ABC", "IjK"]]
  , ["[ia]?[ck]", ["ABC", "IjK"], { nocase: true, null: true }
    , ["xYz", "ABC", "IjK"]]

  // [ pattern, [matches], MM opts, files, TAP opts]
  , "onestar/twostar"
  , ["{/*,*}", [], {null: true}, ["/asdf/asdf/asdf"]]
  , ["{/?,*}", ["/a", "bb"], {null: true}
    , ["/a", "/b/b", "/a/b/c", "bb"]]

  , "dots should not match unless requested"
  , ["**", ["a/b"], {}, ["a/b", "a/.d", ".a/.d"]]

  // .. and . can only match patterns starting with .,
  // even when options.dot is set.
  , function () {
      files = ["a/./b", "a/../b", "a/c/b", "a/.d/b"]
    }
  , ["a/*/b", ["a/c/b", "a/.d/b"], {dot: true}]
  , ["a/.*/b", ["a/./b", "a/../b", "a/.d/b"], {dot: true}]
  , ["a/*/b", ["a/c/b"], {dot:false}]
  , ["a/.*/b", ["a/./b", "a/../b", "a/.d/b"], {dot: false}]


  // this also tests that changing the options needs
  // to change the cache key, even if the pattern is
  // the same!
  , ["**", ["a/b","a/.d",".a/.d"], { dot: true }
    , [ ".a/.d", "a/.d", "a/b"]]

  , "paren sets cannot contain slashes"
  , ["*(a/b)", ["*(a/b)"], {nonull: true}, ["a/b"]]

  // brace sets trump all else.
  //
  // invalid glob pattern.  fails on bash4 and bsdglob.
  // however, in this implementation, it's easier just
  // to do the intuitive thing, and let brace-expansion
  // actually come before parsing any extglob patterns,
  // like the documentation seems to say.
  //
  // XXX: if anyone complains about this, either fix it
  // or tell them to grow up and stop complaining.
  //
  // bash/bsdglob says this:
  // , ["*(a|{b),c)}", ["*(a|{b),c)}"], {}, ["a", "ab", "ac", "ad"]]
  // but we do this instead:
  , ["*(a|{b),c)}", ["a", "ab", "ac"], {}, ["a", "ab", "ac", "ad"]]

  // test partial parsing in the presence of comment/negation chars
  , ["[!a*", ["[!ab"], {}, ["[!ab", "[ab"]]
  , ["[#a*", ["[#ab"], {}, ["[#ab", "[ab"]]

  // like: {a,b|c\\,d\\\|e} except it's unclosed, so it has to be escaped.
  , ["+(a|*\\|c\\\\|d\\\\\\|e\\\\\\\\|f\\\\\\\\\\|g"
    , ["+(a|b\\|c\\\\|d\\\\|e\\\\\\\\|f\\\\\\\\|g"]
    , {}
    , ["+(a|b\\|c\\\\|d\\\\|e\\\\\\\\|f\\\\\\\\|g", "a", "b\\c"]]


  // crazy nested {,,} and *(||) tests.
  , function () {
      files = [ "a", "b", "c", "d"
              , "ab", "ac", "ad"
              , "bc", "cb"
              , "bc,d", "c,db", "c,d"
              , "d)", "(b|c", "*(b|c"
              , "b|c", "b|cc", "cb|c"
              , "x(a|b|c)", "x(a|c)"
              , "(a|b|c)", "(a|c)"]
    }
  , ["*(a|{b,c})", ["a", "b", "c", "ab", "ac"]]
  , ["{a,*(b|c,d)}", ["a","(b|c", "*(b|c", "d)"]]
  // a
  // *(b|c)
  // *(b|d)
  , ["{a,*(b|{c,d})}", ["a","b", "bc", "cb", "c", "d"]]
  , ["*(a|{b|c,c})", ["a", "b", "c", "ab", "ac", "bc", "cb"]]


  // test various flag settings.
  , [ "*(a|{b|c,c})", ["x(a|b|c)", "x(a|c)", "(a|b|c)", "(a|c)"]
    , { noext: true } ]
  , ["a?b", ["x/y/acb", "acb/"], {matchBase: true}
    , ["x/y/acb", "acb/", "acb/d/e", "x/y/acb/d"] ]
  , ["#*", ["#a", "#b"], {nocomment: true}, ["#a", "#b", "c#d"]]


  // begin channelling Boole and deMorgan...
  , "negation tests"
  , function () {
      files = ["d", "e", "!ab", "!abc", "a!b", "\\!a"]
    }

  // anything that is NOT a* matches.
  , ["!a*", ["\\!a", "d", "e", "!ab", "!abc"]]

  // anything that IS !a* matches.
  , ["!a*", ["!ab", "!abc"], {nonegate: true}]

  // anything that IS a* matches
  , ["!!a*", ["a!b"]]

  // anything that is NOT !a* matches
  , ["!\\!a*", ["a!b", "d", "e", "\\!a"]]

  // negation nestled within a pattern
  , function () {
      files = [ "foo.js"
              , "foo.bar"
              // can't match this one without negative lookbehind.
              , "foo.js.js"
              , "blar.js"
              , "foo."
              , "boo.js.boo" ]
    }
  , ["*.!(js)", ["foo.bar", "foo.", "boo.js.boo"] ]

  // https://github.com/isaacs/minimatch/issues/5
  , function () {
      files = [ 'a/b/.x/c'
              , 'a/b/.x/c/d'
              , 'a/b/.x/c/d/e'
              , 'a/b/.x'
              , 'a/b/.x/'
              , 'a/.x/b'
              , '.x'
              , '.x/'
              , '.x/a'
              , '.x/a/b'
              , 'a/.x/b/.x/c'
              , '.x/.x' ]
  }
  , ["**/.x/**", [ '.x/'
                 , '.x/a'
                 , '.x/a/b'
                 , 'a/.x/b'
                 , 'a/b/.x/'
                 , 'a/b/.x/c'
                 , 'a/b/.x/c/d'
                 , 'a/b/.x/c/d/e' ] ]
  , "https://github.com/isaacs/minimatch/issues/59",
  , ["[z-a]", []]
  , ["a/[2015-03-10T00:23:08.647Z]/z", []]
  ]

var regexps =
  [ '/^(?:(?=.)a[^/]*?)$/',
    '/^(?:(?=.)X[^/]*?)$/',
    '/^(?:(?=.)X[^/]*?)$/',
    '/^(?:\\*)$/',
    '/^(?:(?=.)\\*[^/]*?)$/',
    '/^(?:\\*\\*)$/',
    '/^(?:(?=.)b[^/]*?\\/)$/',
    '/^(?:(?=.)c[^/]*?)$/',
    '/^(?:(?:(?!(?:\\/|^)\\.).)*?)$/',
    '/^(?:\\.\\.\\/(?!\\.)(?=.)[^/]*?\\/)$/',
    '/^(?:s\\/(?=.)\\.\\.[^/]*?\\/)$/',
    '/^(?:\\/\\^root:\\/\\{s\\/(?=.)\\^[^:][^/]*?:[^:][^/]*?:\\([^:]\\)[^/]*?\\.[^/]*?\\$\\/1\\/)$/',
    '/^(?:\\/\\^root:\\/\\{s\\/(?=.)\\^[^:][^/]*?:[^:][^/]*?:\\([^:]\\)[^/]*?\\.[^/]*?\\$\\/\u0001\\/)$/',
    '/^(?:(?!\\.)(?=.)[a-c]b[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[a-y][^/]*?[^c])$/',
    '/^(?:(?=.)a[^/]*?[^c])$/',
    '/^(?:(?=.)a[X-]b)$/',
    '/^(?:(?!\\.)(?=.)[^a-c][^/]*?)$/',
    '/^(?:a\\*b\\/(?!\\.)(?=.)[^/]*?)$/',
    '/^(?:(?=.)a\\*[^/]\\/(?!\\.)(?=.)[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\\\\\![^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\![^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\.\\*)$/',
    '/^(?:(?=.)a[b]c)$/',
    '/^(?:(?=.)a[b]c)$/',
    '/^(?:(?=.)a[^/]c)$/',
    '/^(?:a\\*c)$/',
    'false',
    '/^(?:(?!\\.)(?=.)[^/]*?\\/(?=.)man[^/]*?\\/(?=.)bash\\.[^/]*?)$/',
    '/^(?:man\\/man1\\/bash\\.1)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/]*?c)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]c)$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/])$/',
    '/^(?:(?!\\.)(?=.)[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/])$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]c)$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?c)$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?[^/])$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?c)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/])$/',
    '/^(?:(?=.)a[^/]*?cd[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/]k)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/][^/]*?[^/]*?cd[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/]k)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/][^/]*?[^/]*?cd[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/]k[^/]*?[^/]*?[^/]*?)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/][^/]*?[^/]*?cd[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/][^/]*?[^/]*?[^/]*?k)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/][^/]*?[^/]*?cd[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/][^/]*?[^/]*?[^/]*?k[^/]*?[^/]*?)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/]*?[^/]*?c[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/][^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[-abc])$/',
    '/^(?:(?!\\.)(?=.)[abc-])$/',
    '/^(?:\\\\)$/',
    '/^(?:(?!\\.)(?=.)[\\\\])$/',
    '/^(?:(?!\\.)(?=.)[\\[])$/',
    '/^(?:\\[)$/',
    '/^(?:(?=.)\\[(?!\\.)(?=.)[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[\\]])$/',
    '/^(?:(?!\\.)(?=.)[\\]-])$/',
    '/^(?:(?!\\.)(?=.)[a-z])$/',
    '/^(?:(?!\\.)(?=.)[^/][^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?[^/])$/',
    '/^(?:(?!\\.)(?=.)[^/][^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?c)$/',
    '/^(?:(?!\\.)(?=.)[^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?c[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/]*?[^/]*?[^/]*?[^/]*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?c[^/]*?[^/][^/]*?[^/]*?)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?c[^/]*?[^/][^/]*?[^/]*?)$/',
    '/^(?:(?=.)a[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/][^/][^/][^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?[^/]*?)$/',
    '/^(?:\\[\\])$/',
    '/^(?:\\[abc)$/',
    '/^(?:(?=.)XYZ)$/i',
    '/^(?:(?=.)ab[^/]*?)$/i',
    '/^(?:(?!\\.)(?=.)[ia][^/][ck])$/i',
    '/^(?:\\/(?!\\.)(?=.)[^/]*?|(?!\\.)(?=.)[^/]*?)$/',
    '/^(?:\\/(?!\\.)(?=.)[^/]|(?!\\.)(?=.)[^/]*?)$/',
    '/^(?:(?:(?!(?:\\/|^)\\.).)*?)$/',
    '/^(?:a\\/(?!(?:^|\\/)\\.{1,2}(?:$|\\/))(?=.)[^/]*?\\/b)$/',
    '/^(?:a\\/(?=.)\\.[^/]*?\\/b)$/',
    '/^(?:a\\/(?!\\.)(?=.)[^/]*?\\/b)$/',
    '/^(?:a\\/(?=.)\\.[^/]*?\\/b)$/',
    '/^(?:(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\(a\\/b\\))$/',
    '/^(?:(?!\\.)(?=.)(?:a|b)*|(?!\\.)(?=.)(?:a|c)*)$/',
    '/^(?:(?=.)\\[(?=.)\\!a[^/]*?)$/',
    '/^(?:(?=.)\\[(?=.)#a[^/]*?)$/',
    '/^(?:(?=.)\\+\\(a\\|[^/]*?\\|c\\\\\\\\\\|d\\\\\\\\\\|e\\\\\\\\\\\\\\\\\\|f\\\\\\\\\\\\\\\\\\|g)$/',
    '/^(?:(?!\\.)(?=.)(?:a|b)*|(?!\\.)(?=.)(?:a|c)*)$/',
    '/^(?:a|(?!\\.)(?=.)[^/]*?\\(b\\|c|d\\))$/',
    '/^(?:a|(?!\\.)(?=.)(?:b|c)*|(?!\\.)(?=.)(?:b|d)*)$/',
    '/^(?:(?!\\.)(?=.)(?:a|b|c)*|(?!\\.)(?=.)(?:a|c)*)$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\(a\\|b\\|c\\)|(?!\\.)(?=.)[^/]*?\\(a\\|c\\))$/',
    '/^(?:(?=.)a[^/]b)$/',
    '/^(?:(?=.)#[^/]*?)$/',
    '/^(?!^(?:(?=.)a[^/]*?)$).*$/',
    '/^(?:(?=.)\\!a[^/]*?)$/',
    '/^(?:(?=.)a[^/]*?)$/',
    '/^(?!^(?:(?=.)\\!a[^/]*?)$).*$/',
    '/^(?:(?!\\.)(?=.)[^/]*?\\.(?:(?!js)[^/]*?))$/',
    '/^(?:(?:(?!(?:\\/|^)\\.).)*?\\/\\.x\\/(?:(?!(?:\\/|^)\\.).)*?)$/',
    '/^(?:\\[z\\-a\\])$/',
    '/^(?:a\\/\\[2015\\-03\\-10T00:23:08\\.647Z\\]\\/z)$/'
]
var re = 0;

tap.test("basic tests", function (t) {
  var start = Date.now()

  // [ pattern, [matches], MM opts, files, TAP opts]
  patterns.forEach(function (c) {
    if (typeof c === "function") return c()
    if (typeof c === "string") return t.comment(c)

    var pattern = c[0]
      , expect = c[1].sort(alpha)
      , options = c[2] || {}
      , f = c[3] || files
      , tapOpts = c[4] || {}

    // options.debug = true
    var m = new mm.Minimatch(pattern, options)
    var r = m.makeRe()
    var expectRe = regexps[re++]
    expectRe = '/' + expectRe.slice(1, -1).replace(new RegExp('([^\\\\])/', 'g'), '$1\\\/') + '/'
    tapOpts.re = String(r) || JSON.stringify(r)
    tapOpts.re = '/' + tapOpts.re.slice(1, -1).replace(new RegExp('([^\\\\])/', 'g'), '$1\\\/') + '/'
    tapOpts.files = JSON.stringify(f)
    tapOpts.pattern = pattern
    tapOpts.set = m.set
    tapOpts.negated = m.negate

    var actual = mm.match(f, pattern, options)
    actual.sort(alpha)

    t.equivalent( actual, expect
                , JSON.stringify(pattern) + " " + JSON.stringify(expect)
                , tapOpts )

    t.equal(tapOpts.re, expectRe, null, tapOpts)
  })

  t.comment("time=" + (Date.now() - start) + "ms")
  t.end()
})

tap.test("global leak test", function (t) {
  var globalAfter = Object.keys(global)
  t.equivalent(globalAfter, globalBefore, "no new globals, please")
  t.end()
})

function alpha (a, b) {
  return a > b ? 1 : -1
}
