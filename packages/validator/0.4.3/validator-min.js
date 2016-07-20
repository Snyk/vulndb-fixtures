/*!
 * Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */(function(a){function i(a){for(var b in g)a=a.replace(g[b],"");return a}function j(){return"!*$^#(@*#&"}function k(a){return a.replace(">","&gt;").replace("<","&lt;").replace("\\","\\\\")}function l(a){return out="",a.replace(/\s*[a-z\-]+\s*=\s*(?:\042|\047)(?:[^\1]*?)\1/gi,function(a){out+=a.replace(/\/\*.*?\*\//g,"")}),out}var b={"&nbsp;":"\u00a0","&iexcl;":"\u00a1","&cent;":"\u00a2","&pound;":"\u00a3","&curren;":"\u20ac","&yen;":"\u00a5","&brvbar;":"\u0160","&sect;":"\u00a7","&uml;":"\u0161","&copy;":"\u00a9","&ordf;":"\u00aa","&laquo;":"\u00ab","&not;":"\u00ac","&shy;":"\u00ad","&reg;":"\u00ae","&macr;":"\u00af","&deg;":"\u00b0","&plusmn;":"\u00b1","&sup2;":"\u00b2","&sup3;":"\u00b3","&acute;":"\u017d","&micro;":"\u00b5","&para;":"\u00b6","&middot;":"\u00b7","&cedil;":"\u017e","&sup1;":"\u00b9","&ordm;":"\u00ba","&raquo;":"\u00bb","&frac14;":"\u0152","&frac12;":"\u0153","&frac34;":"\u0178","&iquest;":"\u00bf","&Agrave;":"\u00c0","&Aacute;":"\u00c1","&Acirc;":"\u00c2","&Atilde;":"\u00c3","&Auml;":"\u00c4","&Aring;":"\u00c5","&AElig;":"\u00c6","&Ccedil;":"\u00c7","&Egrave;":"\u00c8","&Eacute;":"\u00c9","&Ecirc;":"\u00ca","&Euml;":"\u00cb","&Igrave;":"\u00cc","&Iacute;":"\u00cd","&Icirc;":"\u00ce","&Iuml;":"\u00cf","&ETH;":"\u00d0","&Ntilde;":"\u00d1","&Ograve;":"\u00d2","&Oacute;":"\u00d3","&Ocirc;":"\u00d4","&Otilde;":"\u00d5","&Ouml;":"\u00d6","&times;":"\u00d7","&Oslash;":"\u00d8","&Ugrave;":"\u00d9","&Uacute;":"\u00da","&Ucirc;":"\u00db","&Uuml;":"\u00dc","&Yacute;":"\u00dd","&THORN;":"\u00de","&szlig;":"\u00df","&agrave;":"\u00e0","&aacute;":"\u00e1","&acirc;":"\u00e2","&atilde;":"\u00e3","&auml;":"\u00e4","&aring;":"\u00e5","&aelig;":"\u00e6","&ccedil;":"\u00e7","&egrave;":"\u00e8","&eacute;":"\u00e9","&ecirc;":"\u00ea","&euml;":"\u00eb","&igrave;":"\u00ec","&iacute;":"\u00ed","&icirc;":"\u00ee","&iuml;":"\u00ef","&eth;":"\u00f0","&ntilde;":"\u00f1","&ograve;":"\u00f2","&oacute;":"\u00f3","&ocirc;":"\u00f4","&otilde;":"\u00f5","&ouml;":"\u00f6","&divide;":"\u00f7","&oslash;":"\u00f8","&ugrave;":"\u00f9","&uacute;":"\u00fa","&ucirc;":"\u00fb","&uuml;":"\u00fc","&yacute;":"\u00fd","&thorn;":"\u00fe","&yuml;":"\u00ff","&quot;":'"',"&lt;":"<","&gt;":">","&apos;":"'","&minus;":"\u2212","&circ;":"\u02c6","&tilde;":"\u02dc","&Scaron;":"\u0160","&lsaquo;":"\u2039","&OElig;":"\u0152","&lsquo;":"\u2018","&rsquo;":"\u2019","&ldquo;":"\u201c","&rdquo;":"\u201d","&bull;":"\u2022","&ndash;":"\u2013","&mdash;":"\u2014","&trade;":"\u2122","&scaron;":"\u0161","&rsaquo;":"\u203a","&oelig;":"\u0153","&Yuml;":"\u0178","&fnof;":"\u0192","&Alpha;":"\u0391","&Beta;":"\u0392","&Gamma;":"\u0393","&Delta;":"\u0394","&Epsilon;":"\u0395","&Zeta;":"\u0396","&Eta;":"\u0397","&Theta;":"\u0398","&Iota;":"\u0399","&Kappa;":"\u039a","&Lambda;":"\u039b","&Mu;":"\u039c","&Nu;":"\u039d","&Xi;":"\u039e","&Omicron;":"\u039f","&Pi;":"\u03a0","&Rho;":"\u03a1","&Sigma;":"\u03a3","&Tau;":"\u03a4","&Upsilon;":"\u03a5","&Phi;":"\u03a6","&Chi;":"\u03a7","&Psi;":"\u03a8","&Omega;":"\u03a9","&alpha;":"\u03b1","&beta;":"\u03b2","&gamma;":"\u03b3","&delta;":"\u03b4","&epsilon;":"\u03b5","&zeta;":"\u03b6","&eta;":"\u03b7","&theta;":"\u03b8","&iota;":"\u03b9","&kappa;":"\u03ba","&lambda;":"\u03bb","&mu;":"\u03bc","&nu;":"\u03bd","&xi;":"\u03be","&omicron;":"\u03bf","&pi;":"\u03c0","&rho;":"\u03c1","&sigmaf;":"\u03c2","&sigma;":"\u03c3","&tau;":"\u03c4","&upsilon;":"\u03c5","&phi;":"\u03c6","&chi;":"\u03c7","&psi;":"\u03c8","&omega;":"\u03c9","&thetasym;":"\u03d1","&upsih;":"\u03d2","&piv;":"\u03d6","&ensp;":"\u2002","&emsp;":"\u2003","&thinsp;":"\u2009","&zwnj;":"\u200c","&zwj;":"\u200d","&lrm;":"\u200e","&rlm;":"\u200f","&sbquo;":"\u201a","&bdquo;":"\u201e","&dagger;":"\u2020","&Dagger;":"\u2021","&hellip;":"\u2026","&permil;":"\u2030","&prime;":"\u2032","&Prime;":"\u2033","&oline;":"\u203e","&frasl;":"\u2044","&euro;":"\u20ac","&image;":"\u2111","&weierp;":"\u2118","&real;":"\u211c","&alefsym;":"\u2135","&larr;":"\u2190","&uarr;":"\u2191","&rarr;":"\u2192","&darr;":"\u2193","&harr;":"\u2194","&crarr;":"\u21b5","&lArr;":"\u21d0","&uArr;":"\u21d1","&rArr;":"\u21d2","&dArr;":"\u21d3","&hArr;":"\u21d4","&forall;":"\u2200","&part;":"\u2202","&exist;":"\u2203","&empty;":"\u2205","&nabla;":"\u2207","&isin;":"\u2208","&notin;":"\u2209","&ni;":"\u220b","&prod;":"\u220f","&sum;":"\u2211","&lowast;":"\u2217","&radic;":"\u221a","&prop;":"\u221d","&infin;":"\u221e","&ang;":"\u2220","&and;":"\u2227","&or;":"\u2228","&cap;":"\u2229","&cup;":"\u222a","&int;":"\u222b","&there4;":"\u2234","&sim;":"\u223c","&cong;":"\u2245","&asymp;":"\u2248","&ne;":"\u2260","&equiv;":"\u2261","&le;":"\u2264","&ge;":"\u2265","&sub;":"\u2282","&sup;":"\u2283","&nsub;":"\u2284","&sube;":"\u2286","&supe;":"\u2287","&oplus;":"\u2295","&otimes;":"\u2297","&perp;":"\u22a5","&sdot;":"\u22c5","&lceil;":"\u2308","&rceil;":"\u2309","&lfloor;":"\u230a","&rfloor;":"\u230b","&lang;":"\u2329","&rang;":"\u232a","&loz;":"\u25ca","&spades;":"\u2660","&clubs;":"\u2663","&hearts;":"\u2665","&diams;":"\u2666"},c=function(a){if(!~a.indexOf("&"))return a;for(var c in b)a=a.replace(new RegExp(c,"g"),b[c]);return a=a.replace(/&#x(0*[0-9a-f]{2,5});?/gi,function(a,b){return String.fromCharCode(parseInt(+b,16))}),a=a.replace(/&#([0-9]{2,4});?/gi,function(a,b){return String.fromCharCode(+b)}),a=a.replace(/&amp;/g,"&"),a},d=function(a){a=a.replace(/&/g,"&amp;"),a=a.replace(/'/g,"&#39;");for(var c in b)a=a.replace(new RegExp(b[c],"g"),c);return a};a.entities={encode:d,decode:c};var e={"document.cookie":"[removed]","document.write":"[removed]",".parentNode":"[removed]",".innerHTML":"[removed]","window.location":"[removed]","-moz-binding":"[removed]","<!--":"&lt;!--","-->":"--&gt;","<![CDATA[":"&lt;![CDATA["},f={"javascript\\s*:":"[removed]","expression\\s*(\\(|&\\#40;)":"[removed]","vbscript\\s*:":"[removed]","Redirect\\s+302":"[removed]"},g=[/%0[0-8bcef]/g,/%1[0-9a-f]/g,/[\x00-\x08]/g,/\x0b/g,/\x0c/g,/[\x0e-\x1f]/g],h=["javascript","expression","vbscript","script","applet","alert","document","write","cookie","window"];a.xssClean=function(b,c){if(typeof b=="object"){for(var d in b)b[d]=a.xssClean(b[d]);return b}b=i(b),b=b.replace(/\&([a-z\_0-9]+)\=([a-z\_0-9]+)/i,j()+"$1=$2"),b=b.replace(/(&\#?[0-9a-z]{2,})([\x00-\x20])*;?/i,"$1;$2"),b=b.replace(/(&\#x?)([0-9A-F]+);?/i,"$1;$2"),b=b.replace(j(),"&");try{b=decodeURIComponent(b)}catch(g){}b=b.replace(/[a-z]+=([\'\"]).*?\1/gi,function(a,b){return a.replace(b,k(b))}),b=i(b),b=b.replace("\t"," ");var m=b;for(var d in e)b=b.replace(d,e[d]);for(var d in f)b=b.replace(new RegExp(d,"i"),f[d]);for(var d in h){var n=h[d].split("").join("\\s*")+"\\s*";b=b.replace(new RegExp("("+n+")(\\W)","ig"),function(a,b,c){return b.replace(/\s+/g,"")+c})}do{var o=b;b.match(/<a/i)&&(b=b.replace(/<a\s+([^>]*?)(>|$)/gi,function(a,b,c){return b=l(b.replace("<","").replace(">","")),a.replace(b,b.replace(/href=.*?(alert\(|alert&\#40;|javascript\:|charset\=|window\.|document\.|\.cookie|<script|<xss|base64\s*,)/gi,""))})),b.match(/<img/i)&&(b=b.replace(/<img\s+([^>]*?)(\s?\/?>|$)/gi,function(a,b,c){return b=l(b.replace("<","").replace(">","")),a.replace(b,b.replace(/src=.*?(alert\(|alert&\#40;|javascript\:|charset\=|window\.|document\.|\.cookie|<script|<xss|base64\s*,)/gi,""))}));if(b.match(/script/i)||b.match(/xss/i))b=b.replace(/<(\/*)(script|xss)(.*?)\>/gi,"[removed]")}while(o!=b);event_handlers=["[^a-z_-]on\\w*"],c||event_handlers.push("xmlns"),b=b.replace(new RegExp("<([^><]+?)("+event_handlers.join("|")+")(\\s*=\\s*[^><]*)([><]*)","i"),"<$1$4"),naughty="alert|applet|audio|basefont|base|behavior|bgsound|blink|body|embed|expression|form|frameset|frame|head|html|ilayer|iframe|input|isindex|layer|link|meta|object|plaintext|style|script|textarea|title|video|xml|xss",b=b.replace(new RegExp("<(/*\\s*)("+naughty+")([^><]*)([><]*)","gi"),function(a,b,c,d,e){return"&lt;"+b+c+d+e.replace(">","&gt;").replace("<","&lt;")}),b=b.replace(/(alert|cmd|passthru|eval|exec|expression|system|fopen|fsockopen|file|file_get_contents|readfile|unlink)(\s*)\((.*?)\)/gi,"$1$2&#40;$3&#41;");for(var d in e)b=b.replace(d,e[d]);for(var d in f)b=b.replace(new RegExp(d,"i"),f[d]);if(c&&b!==m)throw new Error("Image may contain XSS");return b};var m=a.Validator=function(){};m.prototype.check=function(a,b){return this.str=a==null||isNaN(a)&&a.length==undefined?"":a+"",this.msg=b,this._errors=[],this},m.prototype.validate=m.prototype.check,m.prototype.assert=m.prototype.check,m.prototype.error=function(a){throw new Error(a)},m.prototype.isEmail=function(){return this.str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/)?this:this.error(this.msg||"Invalid email")},m.prototype.isCreditCard=function(){return this.str=this.str.replace(/[^0-9]+/g,""),this.str.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)?this:this.error(this.msg||"Invalid credit card")},m.prototype.isUrl=function(){return!this.str.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i)||this.str.length>2083?this.error(this.msg||"Invalid URL"):this},m.prototype.isIP=function(){return this.str.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)?this:this.error(this.msg||"Invalid IP")},m.prototype.isAlpha=function(){return this.str.match(/^[a-zA-Z]+$/)?this:this.error(this.msg||"Invalid characters")},m.prototype.isAlphanumeric=function(){return this.str.match(/^[a-zA-Z0-9]+$/)?this:this.error(this.msg||"Invalid characters")},m.prototype.isNumeric=function(){return this.str.match(/^-?[0-9]+$/)?this:this.error(this.msg||"Invalid number")},m.prototype.isLowercase=function(){return this.str.match(/^[a-z0-9]+$/)?this:this.error(this.msg||"Invalid characters")},m.prototype.isUppercase=function(){return this.str.match(/^[A-Z0-9]+$/)?this:this.error(this.msg||"Invalid characters")},m.prototype.isInt=function(){return this.str.match(/^(?:-?(?:0|[1-9][0-9]*))$/)?this:this.error(this.msg||"Invalid integer")},m.prototype.isDecimal=function(){return this.str.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/)?this:this.error(this.msg||"Invalid decimal")},m.prototype.isFloat=function(){return this.isDecimal()},m.prototype.notNull=function(){return this.str===""?this.error(this.msg||"Invalid characters"):this},m.prototype.isNull=function(){return this.str!==""?this.error(this.msg||"Invalid characters"):this},m.prototype.notEmpty=function(){return this.str.match(/^[\s\t\r\n]*$/)?this.error(this.msg||"String is whitespace"):this},m.prototype.equals=function(a){return this.str!=a?this.error(this.msg||"Not equal"):this},m.prototype.contains=function(a){return this.str.indexOf(a)===-1?this.error(this.msg||"Invalid characters"):this},m.prototype.notContains=function(a){return this.str.indexOf(a)>=0?this.error(this.msg||"Invalid characters"):this},m.prototype.regex=m.prototype.is=function(a,b){return typeof a!="function"&&(a=new RegExp(a,b)),this.str.match(a)?this:this.error(this.msg||"Invalid characters")},m.prototype.notRegex=m.prototype.not=function(a,b){return typeof a!="function"&&(a=new RegExp(a,b)),this.str.match(a)&&this.error(this.msg||"Invalid characters"),this},m.prototype.len=function(a,b){return this.str.length<a&&this.error(this.msg||"String is too small"),typeof b!==undefined&&this.str.length>b?this.error(this.msg||"String is too large"):this},m.prototype.isUUID=function(a){return a==3||a=="v3"?pattern=/[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i:a==4||a=="v4"?pattern=/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i:pattern=/[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,this.str.match(pattern)?this:this.error(this.msg||"Not a UUID")},m.prototype.isDate=function(){var a=Date.parse(this.str);return isNaN(a)?this.error(this.msg||"Not a date"):this},m.prototype.isIn=function(a){return a&&typeof a.indexOf=="function"?~a.indexOf(this.str)?this:this.error(this.msg||"Unexpected value"):this.error(this.msg||"Invalid in() argument")},m.prototype.notIn=function(a){return a&&typeof a.indexOf=="function"?a.indexOf(this.str)!==-1?this.error(this.msg||"Unexpected value"):this:this.error(this.msg||"Invalid notIn() argument")},m.prototype.min=function(a){var b=parseFloat(this.str);return!isNaN(b)&&b<a?this.error(this.msg||"Invalid number"):this},m.prototype.max=function(a){var b=parseFloat(this.str);return!isNaN(b)&&b>a?this.error(this.msg||"Invalid number"):this},m.prototype.isArray=function(){return Array.isArray(this.str)?this:this.error(this.msg||"Not an array")};var n=a.Filter=function(){},o="\\r\\n\\t\\s";n.prototype.modify=function(a){this.str=a},n.prototype.convert=n.prototype.sanitize=function(a){return this.str=a,this},n.prototype.xss=function(b){return this.modify(a.xssClean(this.str,b)),this.str},n.prototype.entityDecode=function(){return this.modify(c(this.str)),this.str},n.prototype.entityEncode=function(){return this.modify(d(this.str)),this.str},n.prototype.ltrim=function(a){return a=a||o,this.modify(this.str.replace(new RegExp("^["+a+"]+","g"),"")),this.str},n.prototype.rtrim=function(a){return a=a||o,this.modify(this.str.replace(new RegExp("["+a+"]+$","g"),"")),this.str},n.prototype.trim=function(a){return a=a||o,this.modify(this.str.replace(new RegExp("^["+a+"]+|["+a+"]+$","g"),"")),this.str},n.prototype.ifNull=function(a){return(!this.str||this.str==="")&&this.modify(a),this.str},n.prototype.toFloat=function(){return this.modify(parseFloat(this.str)),this.str},n.prototype.toInt=function(a){return a=a||10,this.modify(parseInt(this.str),a),this.str},n.prototype.toBoolean=function(){return!this.str||this.str=="0"||this.str=="false"||this.str==""?this.modify(!1):this.modify(!0),this.str},n.prototype.toBooleanStrict=function(){return this.str=="1"||this.str=="true"?this.modify(!0):this.modify(!1),this.str},a.sanitize=a.convert=function(b){var c=new a.Filter;return c.sanitize(b)},a.check=a.validate=a.assert=function(b,c){var d=new a.Validator;return d.check(b,c)}})(typeof exports=="undefined"?window:exports);