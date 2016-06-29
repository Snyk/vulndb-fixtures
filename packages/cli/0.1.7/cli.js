/**
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
 */

 //Note: cli includes kof/node-natives and creationix/stack. I couldn't find 
 //license information for either - contact me if you want your license added
 
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    http = require('http'),
    childp = require('child_process');

var cli = exports,
    argv, curr_opt, curr_val, full_opt, is_long,
    short_tags = [], opt_list, parsed = {},
    usage, eq, len, argv_parsed,
    daemon, daemon_arg, hide_status, show_debug,
    replace, natives;

cli.app = null;
cli.version = null;
cli.argv = [];
cli.argc = 0;

cli.options = {};
cli.args = [];

//cli inherits console.* and process.exit
for (var i in console) {
    cli[i] = console[i];
}
cli.output = console.log;
cli.exit = process.exit;

/**
 * Define plugins. Plugins can be enabled / disabled by calling:
 *
 *     `cli.enable(plugin1, [plugin2, ...])`
 *     `cli.disable(plugin1, [plugin2, ...])`
 * 
 * Methods are chainable - `cli.enable(plugin).disable(plugin2)`.
 *
 * The 'help' and 'version' plugins are enabled by default.
 */
var enable = {
    help: true, //Adds -h, --help
    version: true, //Adds -v,--version
    
    //Adds -d,--daemon [ARG] => (see cli.daemon() below)
    daemon: false, 
    
    //Adds -s,--silent & --debug => (see addStatusMethods() below)
    status: false, 
    
    //Add -t,--timeout X => timeout the process after X seconds
    timeout: false,
    
    //Adds -c,--catch => catch and output uncaughtExceptions
    catchall: false,
}

/**
 * Used to enable plugins.
 *
 * @return cli (for chaining)
 * @api public
 */
cli.enable = function (/*plugins*/) {
    Array.prototype.slice.call(arguments).forEach(function (plugin) {
        switch (plugin) {
        case 'daemon':
            try {
                daemon = require('daemon');
                if (typeof daemon.start !== 'function') {
                    throw 'Invalid module';
                }
            } catch (e) {
                cli.fatal('daemon not installed. Please run `npm install daemon`');
            }
            break;
        case 'catchall':
            process.on('uncaughtException', function (err) {
                status('Uncaught exception: ' + (err.msg || err), 'error');
            });
            break;
        case 'help': case 'version': 
        case 'autocomplete': case 'timeout':
            break;
        case 'status':
            addStatusMethods();
            break;
        default:
            cli.fatal('Unknown plugin "' + plugin + '"');
            break;
        }
        enable[plugin] = true;
    });
    return cli;
}

/**
 * Used to disable plugins.
 *
 * @return cli (for chaining)
 * @api public
 */
cli.disable = function (/*plugins*/) {
    Array.prototype.slice.call(arguments).forEach(function (plugin) {
        if (enable[plugin]) {
            enable[plugin] = false;
        }
    });
    return cli;
}

/**
 * A wrapper for child_process.exec().
 * 
 * If the child_process exits successfully, `callback` receives an array of 
 * stdout lines. The current process exits if the child process has an error 
 * and `errback` isn't defined.
 *
 * @param {String} cmd
 * @param {Function} callback (optional)
 * @param {Function} errback (optional)
 * @api public
 */
cli.exec = function (cmd, callback, errback) {
    childp.exec(cmd, function (err, stdout, stderr) {
        err = err || stderr;
        if (err) {
            if (errback) {
                return errback(err);
            }
            return cli.fatal('exec() failed\n' + err);
        }
        if (callback) {
            callback(stdout.split('\n'));
        }
    });
}

/**
 * Sets argv (default is process.argv) with an Array or String.
 *
 * @param {Array|String} argv
 * @param {Boolean} keep_arg0 (optional - default is false)
 * @api public
 */
cli.setArgv = function (arr, keep_arg0) {
    if (!(arr instanceof Array)) {
        arr = arr.split(' ');
        //TODO: Parse argv strings with quoted args
    }

    cli.app = arr.shift();
    
    //Strip off argv[0] if it's 'node'
    if (!keep_arg0 && 'node' === cli.app) {
        cli.app = arr.shift();
    }
    
    cli.app = path.basename(cli.app);
    
    //cli.args is initially equal to argv. A call to parse() or next() will
    //filter out opts
    argv_parsed = false;
    cli.args = cli.argv = argv = arr;
    cli.argc = argv.length;
};
cli.setArgv(process.argv);

/**
 * Returns the next opt, or false if no opts are found.
 *
 * @return {String} opt
 * @api public
 */
cli.next = function () {
    if (!argv_parsed) {
        cli.args = [];
        argv_parsed = true;
    }
    
    curr_val = null;
    
    //If we're currently in a group of short opts (e.g. -abc), return the next opt
    if (short_tags.length) {
        curr_opt = short_tags.shift();
        full_opt = '-' + curr_opt;
        return curr_opt;
    }
    
    if (!argv.length) {
        return false;
    }
    
    curr_opt = argv.shift();
    
    //If an escape sequence is found (- or --), subsequent opts are ignored
    if (curr_opt === '-' || curr_opt === '--') {
        while (argv.length) {
            cli.args.push(argv.shift());
        }
        return false;
    }
    
    //If the next element in argv isn't an opt, add it to the list of args
    if (curr_opt[0] !== '-') {
        cli.args.push(curr_opt);
        return cli.next();
    } else {
        //Check if the opt is short/long
        is_long = curr_opt[1] === '-';
        curr_opt = curr_opt.substr(is_long ? 2 : 1);
    }
    
    //Accept grouped short opts, e.g. -abc => -a -b -c
    if (!is_long && curr_opt.length > 1) {
        short_tags = curr_opt.split('');
        return cli.next();
    }
    
    //Check if the long opt is in the form --option=VALUE
    if (is_long && (eq = curr_opt.indexOf('=')) >= 0) {
        curr_val = curr_opt.substr(eq + 1);
        curr_opt = curr_opt.substr(0, eq);
        len = curr_val.length;
        //Allow values to be quoted
        if ((curr_val[0] === '"' && curr_val[len - 1] === '"') ||
            (curr_val[0] === "'" && curr_val[len - 1] === "'"))
        {
            curr_val = curr_val.substr(1, len-2);
        }
    }
    
    //Save the opt representation for later
    full_opt = (is_long ? '--' : '-') + curr_opt;
    
    return curr_opt;
};

/**
 * Parses command line opts.
 *
 * `opts` must be an object with opts defined like:
 *        long_tag: [short_tag, description, value_type, default_value];
 *
 * The method returns:
 *      long_tag: value
 *
 * See README.md for more information.
 * 
 * @param {Object} opts
 * @return {Object} opts (parsed)
 * @api public
 */
cli.parse = function (opts) {
    var default_val, i, parsed = cli.options, seen;
    opt_list = opts || {};
    while (o = cli.next()) {
        seen = false;
        for (opt in opt_list) {
            if (!(opt_list[opt] instanceof Array)) {
                continue;
            }
            if (opt_list[opt][0] === false) {
                opt_list[opt][0] = opt;
            }
            if (o === opt || o === opt_list[opt][0]) {
                seen = true;
                if (opt_list[opt].length === 2) {
                    parsed[opt] = true;
                    break;
                }
                default_val = null;
                if (opt_list[opt].length === 4) {
                    default_val = opt_list[opt][3];
                }
                if (opt_list[opt][2] instanceof Array) {
                    for (i = 0, l = opt_list[opt][2].length; i < l; i++) {
                        if (typeof opt_list[opt][2][i] === 'number') {
                            opt_list[opt][2][i] += '';
                        }
                    }
                    parsed[opt] = cli.getArrayValue(opt_list[opt][2], is_long ? null : default_val);
                    break;
                }
                if (opt_list[opt][2].toLowerCase) {
                    opt_list[opt][2] = opt_list[opt][2].toLowerCase();
                }
                switch (opt_list[opt][2]) {
                case 'string':
                case 1:
                case true:
                    parsed[opt] = cli.getValue(default_val);
                    break;
                case 'int':
                case 'number':
                case 'num':
                case 'time':
                case 'seconds':
                case 'secs':
                case 'minutes':
                case 'mins':
                case 'x':
                case 'n':
                    parsed[opt] = cli.getInt(default_val);
                    break;
                case 'float':
                case 'decimal':
                    parsed[opt] = cli.getFloat(default_val);
                    break;
                case 'path':
                case 'file':
                case 'directory':
                case 'dir':
                    parsed[opt] = cli.getPath(default_val, opt_list[opt][2]);
                    break;
                case 'email':
                    parsed[opt] = cli.getEmail(default_val);
                    break;
                case 'url':
                case 'uri':
                case 'domain':
                case 'host':
                    parsed[opt] = cli.getUrl(default_val, opt_list[opt][2]);
                    break;
                case 'ip':
                    parsed[opt] = cli.getIp(default_val);
                    break;
                case 'bool':
                case 'boolean':
                case 'on':
                    parsed[opt] = true;
                case 'false':
                case 'off':
                case false:
                case 0:
                    parsed[opt] = false;
                default:
                     cli.fatal('Unknown opt type "' + opt_list[opt][2] + '"');
                }
                break;
            }
        }
        if (!seen) {
            if (enable.version && (o === 'v' || o === 'version')) {
                cli.getVersion();
            } else if (enable.help && (o === 'h' || o === 'help')) {
                cli.getUsage();
            } else if (enable.daemon && (o === 'd' || o === 'daemon')) {
                daemon_arg = cli.getArrayValue(['start','stop','restart','pid','log'], is_long ? null : 'start');
            } else if (enable.catchall && (o === 'c' || o === 'catch')) {
                //
            } else if (enable.status && (o === 's' || o === 'silent' || o === 'debug')) {
                hide_status = (o === 's' || o === 'silent');
                show_debug = o === 'debug';
            } else if (enable.timeout && (o === 't' || o === 'timeout')) {
                var secs = cli.getInt();
                setTimeout(function () {
                    cli.fatal('Process timed out after ' + secs + 's');
                }, secs * 1000);
            } else {
                cli.fatal('Unknown option ' + full_opt);
            }
        }
    }
    //Fill the remaining options with their default value or null
    for (opt in opt_list) {
        default_val = opt_list[opt].length === 4 ? opt_list[opt][3] : null;
        if (!(opt_list[opt] instanceof Array)) {
            parsed[opt] = opt_list[opt];
            continue;
        } else if (typeof parsed[opt] === 'undefined') {
            parsed[opt] = default_val;
        }
    }
    cli.argc = cli.args.length;
    return parsed;
};

/**
 * Adds methods to output styled status messages to the console. To enable
 * status methods, use `cli.enable('status')`.
 *
 * Added methods are cli.info(msg), cli.error(msg), cli.ok(msg), and 
 * cli.debug(msg).
 *
 * Note: 
 *    1) debug() messages are hidden by default. Display them with 
 *       the --debug opt.
 *    2) to hide all status messages, use the -s or --silent opt.
 * 
 * @api private
 */
var addStatusMethods = function () {
    ['info', 'error', 'ok', 'debug'].forEach(function (type) {
        cli[type] = function (msg) {
            status(msg, type);
        };
    });
};

/**
 * Exit the process with a message and status of 1.
 * 
 * @param {String} msg
 * @api public
 */
cli.fatal = function (msg) {
    status(msg, 'fatal');
}

/**
 * Outputs a styled message to the console.
 *
 * @param {String} msg
 * @param {String} type (optional - default = info)
 * @api private
 */
var status = function (msg, type) {
    switch (type) {
    case 'info': 
        msg = '\x1B[33mINFO\x1B[0m: ' + msg; 
        break;
        
    case 'debug':
        msg = '\x1B[36mDEBUG\x1B[0m: ' + msg; 
        break;
        
    case 'error': 
    case 'fatal': 
        msg = '\x1B[31mERROR\x1B[0m: ' + msg;
        break;
        
    case 'ok': 
        msg = '\x1B[32mOK\x1B[0m: ' + msg; 
        break; 
    }
    if (type === 'fatal') {
        console.error(msg);
        process.exit(1);
    }
    if (hide_status || (!show_debug && type === 'debug')) {
        return;
    }
    if (type === 'error') {
        console.error(msg);
    } else {
        console.log(msg);
    }
};

/**
 * Sets the app name.
 * 
 * @param {String} name
 * @return cli (for chaining)
 * @api public
 */
cli.setName = function (name) {
    cli.app = name;
    return cli;
};

/**
 * Sets the app version. `v` can be the version number, or a path 
 * to package.json. If this method is not called, cli will attempt
 * to locate a package.json in ./, ../ or ../../
 * 
 * @param {String} v
 * @return cli (for chaining)
 * @api public
 */
cli.setVersion = function (v) {
    if (v.indexOf('package.json') !== -1) {
        cli.parsePackageJson(v);
    } else {
        cli.version = v;
    }
    return cli;
};

/**
 * Gets the app version. If setVersion has not been called cli will attempt 
 * to locate a package.json in ./, ../ or ../../
 * 
 * @api public
 */
cli.getVersion = function () {
    if (typeof cli.version === 'undefined') {
        //Look for a package.json
        cli.parsePackageJson();
    }
    console.log(cli.app + ' v' + cli.version);
    process.exit();
};

/**
 * Parses the version number from package.json. If no path is specified, cli 
 * will attempt to locate a package.json in ./, ../ or ../../
 * 
 * @param {String} path (optional)
 * @api public
 */
cli.parsePackageJson = function (path) {
    var parse_packagejson = function (path) {
        var packagejson = JSON.parse(fs.readFileSync(path, 'utf8'));
        cli.version = packagejson.version;
    };
    
    var try_all = function (arr, func, err) {
        for (var i = 0, l = arr.length; i < l; i++) {
            try {
                func(arr[i]);
                return;
            } catch (e) {
                if (i === l-1) {
                    cli.fatal(err);
                }
            }
        }
    };
    
    try {
        if (path) {
            return parse_packagejson(path);
        }
        
        try_all([
            __dirname + '/package.json', 
            __dirname + '/../package.json',
            __dirname + '/../../package.json'
        ], parse_packagejson);
    } catch (e) {
        cli.fatal('Could not detect ' + cli.app + ' version');
    }
};

/**
 * Sets the USAGE: string - default is `app [OPTIONS] [ARGS]`.
 * 
 * @param {String} u
 * @return cli (for chaining)
 * @api public
 */
cli.setUsage = function (u) {
    usage = u;
    return cli;
};

/**
 * Automatically build usage information from the opts list. If the help 
 * plugin is enabled (default), this info is displayed with -h, --help.
 * 
 * @api public
 */
cli.getUsage = function () {
    var short, desc, optional, line, seen_opts = [],
        switch_pad = 25;
    
    var pad = function (str, len) {
        if (typeof len === 'undefined') {
            len = str;
            str = '';
        }
        if (str.length < len) {
            len -= str.length;
            while (len--) str += ' ';
        }
        return str;
    };

    var trunc_desc = function (pref, desc, len) {
        var pref_len = pref.length,
            desc_len = 80 - pref_len, 
            truncated = '';
        
        if (desc.length <= desc_len) {
            return desc;
        }
        
        var desc_words = desc.split(' '), chars = 0, word;
        
        while (desc_words.length) {
            truncated += (word = desc_words.shift()) + ' ';
            chars += word.length;
            if (desc_words.length && chars + desc_words[0].length > desc_len) {
                truncated += '\n' + pad(pref_len);
                chars = 0;
            }
        }
        
        return truncated;
    };
        
    usage = usage || cli.app + ' [OPTIONS] [ARGS]';
    console.log('\x1b[1mUsage\x1b[0m:\n  ' + usage);
    console.log('\n\x1b[1mOptions\x1b[0m: ');
    for (opt in opt_list) {
        
        if (opt.length === 1) {
            long = opt_list[opt][0];
            short = opt;
        } else {
            long = opt;
            short = opt_list[opt][0];
        }
        
        //Parse opt_list
        desc = opt_list[opt][1].trim();
        type = opt_list[opt].length >= 3 ? opt_list[opt][2] : null;
        optional = opt_list[opt].length === 4 ? opt_list[opt][3] : null;
        
        //Build usage line
        if (short === long) {
            if (short.length === 1) {
                line = '  -' + short;
            } else {
                line = '      --' + long;
            }
        } else {
            line = '  -' + short + ', --' + long;
        }
        line += ' ';
        
        if (type) {
            if (type instanceof Array) {
                desc += '. VALUE must be either [' + type.join('|') + ']';
                type = 'VALUE';
            }
            if (type === true || type === 1) {
                type = long.toUpperCase();
            }
            type = type.toUpperCase();
            if (type === 'FLOAT' || type === 'INT') {
                type = 'NUMBER';
            }
            line += optional ? '[' + type + ']' : type;
        }
        line = pad(line, switch_pad);
        line += trunc_desc(line, desc);
        line += optional ? ' (Default is ' + optional + ')' : '';
        console.log(line);
        
        seen_opts.push(short);
        seen_opts.push(long);
    }
    if (enable.timeout && seen_opts.indexOf('t') === -1 && seen_opts.indexOf('timeout') === -1) {
        console.log(pad('  -t, --timeout N', switch_pad) + 'Exit if the process takes longer than N seconds');
    }
    if (enable.status) {
        if (seen_opts.indexOf('s') === -1 && seen_opts.indexOf('silent') === -1) {
            console.log(pad('  -s, --silent', switch_pad) + 'Hide all console status messages');
        }
        if (seen_opts.indexOf('debug') === -1) {
            console.log(pad('      --debug', switch_pad) + 'Show debug information');
        }
    } 
    if (enable.catchall && seen_opts.indexOf('c') === -1 && seen_opts.indexOf('catch') === -1) {
        console.log(pad('  -c, --catch', switch_pad) + 'Catch unanticipated errors');
    }
    if (enable.daemon && seen_opts.indexOf('d') === -1 && seen_opts.indexOf('daemon') === -1) {
        console.log(pad('  -d, --daemon [ARG]', switch_pad) + 'Daemonize the process. Control the daemon using [start, stop, restart, log, pid]');
    }
    if (enable.version && seen_opts.indexOf('v') === -1 && seen_opts.indexOf('version') === -1) {
        console.log(pad('  -v, --version', switch_pad) + 'Display the current version');
    }
    if (enable.help && seen_opts.indexOf('h') === -1 && seen_opts.indexOf('help') === -1) {
        console.log(pad('  -h, --help', switch_pad) + 'Display help and usage details');
    }
    process.exit();
};

/**
 * Generates an error message when an opt is incorrectly used.
 * 
 * @param {String} expects (e.g. 'a value')
 * @param {String} type (e.g. 'VALUE')
 * @api public
 */
cli.getOptError = function (expects, type) {
    var err = full_opt + ' expects ' + expects 
            + '. Use `' + cli.app + ' ' + full_opt + (is_long ? '=' : ' ') + type + '`';
    return err;
};

/**
 * Gets the next opt value and validates it with an optional validation
 * function. If validation fails or no value can be obtained, this method
 * will return the default value (if specified) or exit with err_msg.
 * 
 * @param {String} default_val
 * @param {Function} validate_func
 * @param {String} err_msg
 * @api public
 */
cli.getValue = function (default_val, validate_func, err_msg) {
    err_msg = err_msg || cli.getOptError('a value', 'VALUE');
    
    var value;
    
    try {
    
        if (curr_val) {
            if (validate_func) {
                curr_val = validate_func(curr_val);
            }
            return curr_val;
        }
    
        //Grouped short opts aren't allowed to have values
        if (short_tags.length) {
            throw 'Short tags';
        }
    
        //If there's no args left or the next arg is an opt, return the 
        //default value (if specified) - otherwise fail
        if (!argv.length || argv[0][0] === '-') {
            throw 'No value';
        }
        
        value = argv.shift();
        
        //Run the value through a validation/transformation function if specified
        if (validate_func) {
            value = validate_func(value);
        }
        
    } catch (e) {
        
        //The value didn't pass the validation/transformation. Unshift the value and
        //return the default value (if specified)
        if (value) {
            argv.unshift(value);
        }
        return default_val || cli.fatal(err_msg);
        
    }
    
    return value;
};

cli.getInt = function (default_val) {
    return cli.getValue(default_val, function (value) {
        if (!value.match(/^(?:-?(?:0|[1-9][0-9]*))$/)) {
            throw 'Invalid int';
        }
        return parseInt(value, 10);
    }, cli.getOptError('a number', 'NUMBER'));
}

cli.getFloat = function (default_val) {
    return cli.getValue(default_val, function (value) {
        if (!value.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/)) {
            throw 'Invalid float';
        }
        return parseFloat(value, 10);
    }, cli.getOptError('a number', 'NUMBER'));
}

cli.getUrl = function (default_val, identifier) {
    identifier = identifier || 'url';
    return cli.getValue(default_val, function (value) {
        if (!value.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/)) {
            throw 'Invalid URL';
        }
        return value;
    }, cli.getOptError('a ' + identifier, identifier.toUpperCase()));
}

cli.getEmail = function (default_val) {
    return cli.getValue(default_val, function (value) {
        if (!value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/)) {
            throw 'Invalid email';
        }
        return value;
    }, cli.getOptError('an email', 'EMAIL'));
}

cli.getIp = function (default_val) {
    return cli.getValue(default_val, function (value) {
        if (!value.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
            throw 'Invalid IP';
        }
        return value;
    }, cli.getOptError('an IP', 'IP'));
}

cli.getPath = function (default_val, identifier) {
    identifier = identifier || 'path';
    return cli.getValue(default_val, function (value) {
        if (value.match(/[?*:;{}]/)) {
            throw 'Invalid path';
        }
        return value;
    }, cli.getOptError('a ' + identifier, identifier.toUpperCase()));
}

cli.getArrayValue = function (arr, default_val) {
    return cli.getValue(default_val, function (value) {
        if (arr.indexOf(value) === -1) {
            throw 'Unexpected value';
        }
        return value;
    }, cli.getOptError('either [' + arr.join('|') + ']', 'VALUE'));
}

/**
 * Gets all data from STDIN (with optional encoding) and sends it to callback.
 * 
 * @param {String} encoding (optional - default is 'utf8')
 * @param {Function} callback
 * @api public
 */
cli.withStdin = function (encoding, callback) {
    if (typeof encoding === 'function') {
        callback = encoding;
        encoding = 'utf8';
    }
    var stream = process.openStdin(), data = '';
    stream.setEncoding(encoding);
    stream.on('data', function (chunk) {
        data += chunk;
    });
    stream.on('end', function () {
        callback.apply(cli, [data]);
    });
};

/**
 * Gets all data from an input file or STDIN when apps are in the form of either:
 *     app input_file.txt
 *     app < input_file.txt
 * 
 * @param {String} encoding (optional - default is 'utf8')
 * @param {Function} callback
 * @api public
 */
cli.withInput = function (encoding, callback) {
    if (typeof encoding === 'function') {
        callback = encoding;
        encoding = 'utf8';
    }
    try {
        if (!cli.args.length) {
            throw 'No args';
        }
        var path = cli.args[0], data;
        if (path.indexOf('/') === -1) {
            path = process.cwd() + '/' + path;
        }
        if (encoding === 'stream') {
            data = fs.createReadStream(path);
        } else {
            data = fs.readFileSync(path, encoding);
        }
        callback.apply(cli, [data]);
    } catch (e) {
        //First arg isn't a file, read from STDIN instead
        cli.withStdin.apply(this, arguments);
    }
};

/**
 * Gets all data from STDIN, splits the data into lines and sends it 
 * to callback.
 * 
 * @param {Function} callback
 * @api public
 */
cli.withStdinLines = function (callback) {
    cli.withStdin(function (data) {
        var sep = data.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
        callback.apply(cli, [data.split(sep), sep]);
    });
};

/**
 * See withInput().
 * 
 * @param {Function} callback
 * @api public
 */
cli.withInputLines = function (callback) {
    cli.withInput(function (data) {
        var sep = data.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
        callback.apply(cli, [data.split(sep), sep]);
    });
};

/**
 * A method for creating and controlling a daemon.
 *
 * `arg` can be:
 *      start = daemonizes the process
 *      stop  = stops the daemon if it is running
 *      restart = alias for stop -> start
 *      pid = outputs the daemon's PID if it is running
 *      log = outputs the daemon's log file (stdout + stderr)
 *
 * @param {String} arg (Optional - default is 'start')
 * @param {Function} callback
 * @api public
 */
cli.daemon = function (arg, callback) {
    if (typeof daemon === 'undefined') {
        cli.fatal('Daemon is not initialized');
    }
    
    if (typeof arg === 'function') {
        callback = arg;
        arg = 'start';
    }
    
    var lock_file = '/tmp/' + cli.app + '.pid',
        log_file = '/tmp/' + cli.app + '.log';
    
    var start = function () {
        daemon.run(log_file, lock_file, function (err) {
            if (err) return status('Error starting daemon: ' + err, 'error');
            callback();
        });
    };
    
    var stop = function () {
        try {
            fs.readFileSync(lock_file);
        } catch (e) {
            return status('Daemon is not running', 'error');
        };
        daemon.stop(lock_file, function (err, pid) {
            if (err && err.errno === 3) {
                return status('Daemon is not running', 'error');
            } else if (err) {
                return status('Error stopping daemon: ' + err.errno, 'error');
            }
            status('Successfully stopped daemon with pid: ' + pid, 'ok');
        });
    };
    
    switch(arg) {
    case 'stop':
        stop();
        break;
    case 'restart':
        daemon.stop(lock_file, function () {
            start();
        });
        break;
    case 'log':
        try {
            console.log(fs.readFileSync(log_file, 'utf8'));
        } catch (e) {
            return status('No daemon log file', 'error');
        };
        break;
    case 'pid':
        try {
            var pid = fs.readFileSync(lock_file, 'utf8');
            fs.statSync('/proc/' + pid);
            status(pid, 'info');
        } catch (e) {
            return status('Daemon is not running', 'error');
        };
        break;
    default:
        start();
        break;
    }
}

/**
 * The main entry method. Calling cli.main() is only necessary in
 * scripts that have daemon support enabled. `callback` receives (args, options)
 *
 * @param {Function} callback
 * @api public
 */
cli.main = function (callback) {
    var after = function () {
        callback.apply(cli, [cli.args, cli.options]);
    };
    if (enable.daemon && daemon_arg) {
        cli.daemon(daemon_arg, after);
    } else {
        after();
    }
}

/**
 * Bind kof's node-natives (https://github.com/kof/node-natives) to cli.native
 * 
 * Rather than requiring node natives (e.g. var path = require('path)), all
 * native modules can be accessed like `cli.native.path`
 *
 * @param {String} name
 */
var define_native = function (name) {
    Object.defineProperty(cli.native, name, {
        enumerable : true,
        configurable : true,
        get: function() {
            delete cli.native[name];
            return cli.native[name] = require(name);
        }
    });
}
cli.native = {};
natives = process.binding('natives');
for (var nat in natives) {
    define_native(nat);
}

/**
 * Bind creationix's stack (https://github.com/creationix/stack).
 *
 * Create a simple middleware stack by calling:
 *
 *     cli.createServer(middleware).listen(port);
 *
 * @return {Server} server
 * @api public
 */
cli.createServer = function(/*layers*/) {
    var defaultStackErrorHandler = function error(req, res, err) {
        if (err) {
            console.error(err.stack);
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end(err.stack + "\n");
            return;
        }
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Not Found\n");
    };
    var handle = error = defaultStackErrorHandler,
        layers = Array.prototype.slice.call(arguments);
    
    //Allow createServer(a,b,c) and createServer([a,b,c])
    if (layers.length && layers[0] instanceof Array) {
        layers = layers[0];
    }
    
    layers.reverse().forEach(function (layer) {
        var child = handle;
        handle = function (req, res) {
            try {
                layer(req, res, function (err) {
                    if (err) { 
                        return error(req, res, err); 
                    }
                    child(req, res);
                });
            } catch (err) {
                error(req, res, err);
            }
        };
    });
    return http.createServer(handle);
};

/**
 * Inteprets and replaces backslash escapes in a string.
 *
 * @param {String} str
 * @return {String} replaced
 * @api public
 */
replace = {'\\n':'\n','\\r':'\r','\\t':'\t','\\e':'\e','\\v':'\v','\\f':'\f','\\c':'\c','\\b':'\b','\\a':'\a','\\\\':'\\'};
cli.escape = function (str) {
    string += '';
    for (var i in replace) {
        string = string.replace(i, replace[i]);
    }
    return string;
}