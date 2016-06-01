#!/usr/bin/env node

//----------------------------------------------------------------------------------------------------------------------
/// Main Spiderworks Script
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var path = require('path');
var chalk = require('chalk');
var program = require('commander');

var pkg = require('./package');
var paths = require('./lib/paths');
var contentGen = require('./lib/generator');
var devServer = require('./lib/devel');

//----------------------------------------------------------------------------------------------------------------------

program.version(pkg.version);

//----------------------------------------------------------------------------------------------------------------------
// `create` command
//----------------------------------------------------------------------------------------------------------------------

program
    .command('create <site>')
    .alias('new')
    .description('Creates a new default site with the name <site>.')
    .action((site) =>
    {
        console.log(chalk.magenta('>> ') + `Creating "${ chalk.cyan(site) }".`);
        contentGen.create(site)
            .then(() =>
            {
                console.log(chalk.yellow('>> ') + chalk.green('Done.'));
            })
            .catch((error) =>
            {
                console.error(`Create Error: \n ${ error.stack || error }`);
                process.exit(1);
            });
    });

//----------------------------------------------------------------------------------------------------------------------
// `clean` command
//----------------------------------------------------------------------------------------------------------------------

program
    .command('clean [directory]')
    .description('Cleans the generated source files from <directory>.')
    .action((directory) =>
    {
        var sourceDir = process.cwd();
        if(directory)
        {
            sourceDir = path.join(sourceDir, directory);
        } // end if
        paths.sourceDir = sourceDir;
        
        console.log(chalk.magenta('>> ') + `Cleaning "${ chalk.cyan(sourceDir) }".`);
        
        contentGen.clean(sourceDir)
            .then(() =>
            {
                console.log(chalk.yellow('>> ') + chalk.green('Done.'));
            })
            .catch((error) =>
            {
                console.error(`Clean Error: \n ${ error.stack || error }`);
                process.exit(1);
            });
    });

//----------------------------------------------------------------------------------------------------------------------
// `generate` command
//----------------------------------------------------------------------------------------------------------------------

program
    .command('generate [directory]')
    .description('Generates the site from the source files in <directory>.')
    .option("-c, --clean", "clean the output directory before generation")
    .action((directory, options) =>
    {
        var sourceDir = process.cwd();
        if(directory)
        {
            sourceDir = path.join(sourceDir, directory);
        } // end if
        paths.sourceDir = sourceDir;

        console.log(chalk.magenta('>> ') + `Generating from "${ chalk.cyan(sourceDir) }".`);

        contentGen.generate(sourceDir, { clean: options.clean })
            .then(() =>
            {
                console.log(chalk.yellow('>> ') + chalk.green('Done.'));
            })
            .catch((error) =>
            {
                console.error(chalk.red('>>') + `Generation Error: \n ${ error.stack || error }`);
                process.exit(1);
            });
    });

//----------------------------------------------------------------------------------------------------------------------
// `watch` command
//----------------------------------------------------------------------------------------------------------------------

program
    .command('watch [directory]')
    .description('Starts a development server and watches the source folder for changes.')
    .option("-p, --port <port>", "The port to start the development HTTP server on")
    .action((directory, options) =>
    {
        var sourceDir = process.cwd();
        if(directory)
        {
            sourceDir = path.join(sourceDir, directory);
        } // end if
        paths.sourceDir = sourceDir;
        
        // Start the dev server
        devServer.start(sourceDir, { port: options.port });
    });

//----------------------------------------------------------------------------------------------------------------------

// Print the help text if nothing was input
if(process.argv.length < 3)
{
    program.outputHelp();
} // end if

// Parse the arguments
program.parse(process.argv);

//----------------------------------------------------------------------------------------------------------------------
