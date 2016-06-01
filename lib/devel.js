//----------------------------------------------------------------------------------------------------------------------
/// DevelopmentServer
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');
var chalk = require('chalk');
var Promise = require('bluebird');
var nodeStatic = require('node-static');
var chokidar = require('chokidar');

// Internal Modules
var paths = require('./paths');
var contentGen = require('./generator');

// Managers
var configMan = require('./config');

//----------------------------------------------------------------------------------------------------------------------

class DevelopmentServer {
    constructor()
    {
        this.changePromise = Promise.resolve();
    } // end constructor

    _changeFunc(event, filePath)
    {
        console.log(chalk.green('\n>> ') + `file "${ chalk.cyan(path.relative(paths.sourceDir, filePath)) }" was ${ event }.`);
        
        this.changePromise = this.changePromise
            .then(() =>
            {
                console.log(chalk.yellow('>> ') + 'Regenerating...');
                return contentGen.generate(paths.sourceDir, { clean: true })
                    .then(() =>
                    {
                        console.log(chalk.yellow('>> ') + chalk.green('Done.'));
                    })
                    .catch((error) =>
                    {
                        console.error(chalk.red('>> ') + `Generation Error: \n ${ error.stack || error }`);
                    });
            });
    } // end _changeFunc

    watch(sourceDir)
    {
        var outDir = path.join(sourceDir, configMan.config.directories.output);
        this.watcher = chokidar.watch(sourceDir, {
            ignored: [
                /[\/\\]\./,
                outDir + '/**/*'
            ],
            persistent: true
        });

        // Add event listeners.
        this.watcher.on('ready', () =>
        {
            console.log(chalk.magenta('>> ') + `Watching "${ chalk.cyan(sourceDir) }" for changes.`);

            this.watcher
                .on('add', (path) => this._changeFunc('added', path))
                .on('change', (path) => this._changeFunc('changed', path))
                .on('unlink', (path) => this._changeFunc('removed', path));
        });
    } // end watch

    stopWatch()
    {
        if(this.watcher)
        {
            this.watcher.close();
        } // end if
    } // end stopWatch

    serve(dir, options)
    {
        options = options  || {};
        var port = options.port || 8080;
        var fileServer = new nodeStatic.Server(dir);

        console.log(chalk.magenta('>> ') + `Serving static filed from "${ chalk.cyan(dir) }" on port ${ chalk.magenta(port) }.`);

        require('http').createServer((request, response) =>
            {
                request.addListener('end', () =>
                    {
                        fileServer.serve(request, response);
                    })
                    .resume();
            })
            .listen(port);
    } // end serve

    start(sourceDir, options)
    {
        // Load config
        configMan.load(sourceDir);

        var outDir = path.join(sourceDir, configMan.config.directories.output);

        this.watch(sourceDir);
        this.serve(outDir, options);
    } // end start
} // end DevelopmentServer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new DevelopmentServer();

//----------------------------------------------------------------------------------------------------------------------
