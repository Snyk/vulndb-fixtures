**cli is a toolkit for rapidly building NodeJS command line apps - it includes:**

- Full featured opts/args parser
- Plugin support for adding common options and switches
- Helper methods for working with stdin/stdout and spawning child processes

Install using `npm install cli` or just bundle [cli.js](https://github.com/chriso/cli/raw/master/cli.js) with your app.

## Example apps

**sort.js** - Usage: `$ ./sort.js < input.txt`

    #!/usr/bin/env node
    require('cli').withStdinLines(function(lines, newline) {
        this.output(lines.sort().join(newline));
    });
    
Let's add support for an `-n` switch to use a numeric sort, and a `-r` switch to reverse output - only 5 extra lines of code (!)
    
    var cli = require('cli'), options = cli.parse();
    
    cli.withStdinLines(function(lines, newline) {
        lines.sort(!options.n ? null : function(a, b) {
            return parseInt(a) > parseInt(b);
        });
        if (options.r) lines.reverse();
        this.output(lines.join(newline));
    });

Now let's create a static file server with daemon support to see the opts parser + plugins in use.

**static.js** - requires `npm install creationix daemon`

    #!/usr/bin/env node

    var cli = require('cli').enable('daemon', 'status'); //Enable 2 plugins

    cli.parse({
        log:   ['l', 'Enable logging'],
        port:  ['p', 'Listen on this port', 'number', 8080],
        serve: [false, 'Serve static files from PATH', 'path', './public']
    });

    cli.main(function(args, options) {
        var server, middleware = [];
        
        if (options.log) {
            this.debug('Enabling logging');
            middleware.push(require('creationix/log')());
        }

        this.debug('Serving files from ' + options.serve);
        middleware.push(require('creationix/static')('/', options.serve, 'index.html'));
        
        server = this.createServer(middleware).listen(options.port);
        
        this.ok('Listening on port ' + options.port);
    });
    
To output usage information

    $ ./static.js --help
    
To create a daemon that serves files from */tmp*, run

    $ ./static.js -ld --serve=/tmp

Need to view the log? `$ ./static.js -d log`. Need to stop the daemon? `$ ./static.js -d stop`. 

For more examples, see [./examples](https://github.com/chriso/cli/tree/master/examples)

## Helper methods

cli has a helper method for working with input file(s) or *stdin* (see [./examples/cat.js](https://github.com/chriso/cli/blob/master/examples/cat.js) for an example). `newline` is autodetected as \n or \r\n

    cli.withInput(file, function (line, newline, eof) {
        if (!eof) {
            this.output(line + newline);
        }
    });

*Note: `file` can be omitted if you want to work with stdin*

cli also has blocking methods that collect all input before calling callback

    cli.withStdin(callback);        //callback receives stdin as a string
    cli.withStdinLines(callback);   //callback receives (lines, newline)

To spawn a child process, use

    cli.exec(cmd, callback); //callback receives the output of the process (split into lines)

cli comes bundled with kof's [node-natives](https://github.com/kof/node-natives) and creationix' [stack](https://github.com/creationix/stack)

## Plugins

Plugins are a way of adding common opts and can be enabled using 
    
    cli.enable(plugin1, [plugin2, ...]);  //To disable, use the equivalent disable() method
   
**help** - *enabled by default*

Adds `-h,--help` to output auto-generated usage information

**version**

Adds `-v,--version` to output version information for the app. cli will attempt to locate and parse a nearby *package.json*

To set your own app name and version, use `cli.setApp(app_name, version)`

**status**

Adds options to show/hide the stylized status messages that are output to the console when using one of these methods

    cli.debug(msg);  //Only shown when using --debug
    cli.error(msg);  
    cli.fatal(msg);  //Exits the process after outputting msg
    cli.info(msg);
    cli.ok(msg);

`-s,--silent` will omit all status messages (except for fatal)

**daemon**  - *requires* `npm install daemon`
    
Adds `-d,--daemon ARG` for daemonizing the process and controlling the resulting daemon

`ARG` can be either start (default), stop, restart, pid (outputs the daemon's pid if it's running), or log (output the daemon's stdout+stderr)

**timeout**

Adds `-t,--timeout N` to exit the process after N seconds with an error

**catchall**

Adds `-c,--catch` to catch and output uncaughtExceptions and resume execution

*Note: Plugins are automatically disabled if an option or switch of the same name is already defined*

## LICENSE

(MIT license)

Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.