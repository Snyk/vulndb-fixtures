// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore may be freely distributed under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){var s=this,K=s._,o={},k=Array.prototype,p=Object.prototype,L=k.push,g=k.slice,l=p.toString,M=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,N=Object.keys,t=Function.prototype.bind,b=function(a){if(a instanceof b)return a;if(!(this instanceof b))return new b(a);this._wrapped=a};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;
b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,h=a.length;e<h;e++){if(c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,f,i){e[e.length]=c.call(b,a,f,i)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var h=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return h?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,g){if(h)d=c.call(e,d,a,b,g);else{d=a;h=true}});if(!h)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var h=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return h?a.reduceRight(c,d):a.reduceRight(c)}var f=b.toArray(a).reverse();e&&!h&&(c=b.bind(c,e));return h?b.reduce(f,c,d,e):b.reduce(f,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,f,i){if(c.call(b,a,f,i)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,f,i){c.call(b,a,f,i)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,f,i){c.call(b,a,f,i)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,d){c||(c=b.identity);var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,d);j(a,function(a,b,
i){if(!(e=e&&c.call(d,a,b,i)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,i){if(e||(e=c.call(d,a,b,i)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=g.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c:a[c]).apply(a,
d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0]&&a.length<65535)return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,i){b=c?c.call(d,a,b,i):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0]&&a.length<65535)return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,
function(a,b,i){b=c?c.call(d,a,b,i):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var c,b=0,e=[];j(a,function(a){c=Math.floor(Math.random()*++b);e[b-1]=e[c];e[c]=a});return e};b.sortBy=function(a,c,d){var e=H(a,c);return b.pluck(b.map(a,function(a,c,b){return{value:a,criteria:e.call(d,a,c,b)}}).sort(function(a,c){var b=a.criteria,d=c.criteria;return b===void 0?1:d===void 0?-1:b<d?-1:b>d?1:0}),"value")};var H=function(a,c){return b.isFunction(c)?c:function(a){return a[c]}},
I=function(a,c,b){var e={},h=H(a,c);j(a,function(a,c){var g=h(a,c);b(e,g,a)});return e};b.groupBy=function(a,c){return I(a,c,function(a,c,b){(a[c]||(a[c]=[])).push(b)})};b.countBy=function(a,c){return I(a,c,function(a,c){a[c]||(a[c]=0);a[c]++})};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var c=d(c),e=0,h=a.length;e<h;){var f=e+h>>1;d(a[f])<c?e=f+1:h=f}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?g.call(a):b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=
function(a){return a.length===+a.length?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,c,b){return c!=null&&!b?g.call(a,0,c):a[0]};b.initial=function(a,c,b){return g.call(a,0,a.length-(c==null||b?1:c))};b.last=function(a,c,b){return c!=null&&!b?g.call(a,Math.max(a.length-c,0)):a[a.length-1]};b.rest=b.tail=b.drop=function(a,c,b){return g.call(a,c==null||b?1:c)};b.compact=function(a){return b.filter(a,function(a){return!!a})};var r=function(a,c,d){j(a,function(a){b.isArray(a)?c?L.apply(d,
a):r(a,c,d):d.push(a)});return d};b.flatten=function(a,b){return r(a,b,[])};b.without=function(a){return b.difference(a,g.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,e=[];b.reduce(d,function(d,f,i){if(c?b.last(d)!==f||!d.length:!b.include(d,f)){d.push(f);e.push(a[i])}return d},[]);return e};b.union=function(){return b.uniq(r(arguments,true,[]))};b.intersection=function(a){var c=g.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,
a)>=0})})};b.difference=function(a){var c=r(g.call(arguments,1),true,[]);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=g.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.object=function(a,b){for(var d={},e=0,h=a.length;e<h;e++)b?d[a[e]]=b[e]:d[a[e][0]]=a[e][1];return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=
0;for(e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),h=0,f=Array(e);h<e;){f[h++]=a;a=a+d}return f};var J=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,g.call(arguments,1));if(!b.isFunction(a))throw new TypeError;
e=g.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(g.call(arguments)));J.prototype=a.prototype;var b=new J,f=a.apply(b,e.concat(g.call(arguments)));return Object(f)===f?f:b}};b.bindAll=function(a){var c=g.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=
function(a,b){var d=g.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(g.call(arguments,1)))};b.throttle=function(a,c){var d,e,h,f,i,g,j=b.debounce(function(){i=f=false},c);return function(){d=this;e=arguments;h||(h=setTimeout(function(){h=null;i&&(g=a.apply(d,e));j()},c));if(f)i=true;else{f=true;g=a.apply(d,e)}j();return g}};b.debounce=function(a,b,d){var e;return function(){var h=this,f=arguments,i=d&&!e;clearTimeout(e);
e=setTimeout(function(){e=null;d||a.apply(h,f)},b);i&&a.apply(h,f)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;d=a.apply(this,arguments);a=null;return d}};b.wrap=function(a,b){return function(){var d=[a].concat(g.call(arguments,0));return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};
b.keys=N||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.pairs=function(a){return b.map(a,function(a,b){return[b,a]})};b.invert=function(a){return b.reduce(a,function(a,b,e){a[b]=e;return a},{})};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){j(g.call(arguments,1),function(b){for(var d in b)a[d]=
b[d]});return a};b.pick=function(a){var c={},d=b.flatten(g.call(arguments,1));j(d,function(b){b in a&&(c[b]=a[b])});return c};b.omit=function(a){var c={},d=b.flatten(g.call(arguments,1)),e;for(e in a)b.include(d,e)||(c[e]=a[e]);return c};b.defaults=function(a){j(g.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};var u=function(a,c,d,e){if(a===c)return a!==
0||1/a==1/c;if(a==null||c==null)return a===c;if(a instanceof b)a=a._wrapped;if(c instanceof b)c=c._wrapped;if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var h=l.call(a);if(h!=l.call(c))return false;switch(h){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:a==0?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==c.source&&a.global==c.global&&
a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if(typeof a!="object"||typeof c!="object")return false;for(var f=d.length;f--;)if(d[f]==a)return e[f]==c;d.push(a);e.push(c);var f=0,i=true;if(h=="[object Array]"){f=a.length;if(i=f==c.length)for(;f--;)if(!(i=f in a==f in c&&u(a[f],c[f],d,e)))break}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return false;for(var g in a)if(b.has(a,g)){f++;if(!(i=b.has(c,g)&&u(a[g],c[g],d,e)))break}if(i){for(g in c)if(b.has(c,g)&&!f--)break;
i=!f}}d.pop();e.pop();return i};b.isEqual=function(a,b){return u(a,b,[],[])};b.isEmpty=function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};j("Arguments,Function,String,Number,Date,RegExp".split(","),function(a){b["is"+a]=function(b){return l.call(b)=="[object "+
a+"]"}});b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,b){return M.call(a,b)};b.noConflict=function(){s._=K;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=
0;e<a;e++)b.call(d,e)};b.random=function(a,b){return a+(0|Math.random()*(b-a+1))};var m={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};m.unescape=b.invert(m.escape);var O={escape:RegExp("["+b.keys(m.escape).join("")+"]","g"),unescape:RegExp("("+b.keys(m.unescape).join("|")+")","g")};b.each(["escape","unescape"],function(a){b[a]=function(b){return b==null?"":(""+b).replace(O[a],function(b){return m[a][b]})}});b.result=function(a,c){if(a==null)return null;var d=
a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){var d=b[c]=a[c];b.prototype[c]=function(){var a=g.call(arguments);a.unshift(this._wrapped);a=d.apply(b,a);return this._chain?b(a).chain():a}})};var P=0;b.uniqueId=function(a){var b=P++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var v=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},w;for(w in n)n[n[w]]=
w;var Q=/\\|'|\r|\n|\t|\u2028|\u2029/g,R=/\\(\\|'|r|n|t|u2028|u2029)/g,x=function(a){return a.replace(R,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults({},d,b.templateSettings);a="__p+='"+a.replace(Q,function(a){return"\\"+n[a]}).replace(d.escape||v,function(a,b){return"'+\n((__t=("+x(b)+"))==null?'':_.escape(__t))+\n'"}).replace(d.interpolate||v,function(a,b){return"'+\n((__t=("+x(b)+"))==null?'':__t)+\n'"}).replace(d.evaluate||v,function(a,b){return"';\n"+x(b)+"\n__p+='"})+
"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");a="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{var e=new Function(d.variable||"obj","_",a)}catch(g){g.source=a;throw g;}if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};b.chain=function(a){return b(a).chain()};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var c=k[a];b.prototype[a]=
function(){var d=this._wrapped;c.apply(d,arguments);(a=="shift"||a=="splice")&&d.length===0&&delete d[0];return this._chain?b(d).chain():d}});j(["concat","join","slice"],function(a){var c=k[a];b.prototype[a]=function(){var a=c.apply(this._wrapped,arguments);return this._chain?b(a).chain():a}});b.extend(b.prototype,{chain:function(){this._chain=true;return this},value:function(){return this._wrapped}})}).call(this);