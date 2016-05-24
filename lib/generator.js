//----------------------------------------------------------------------------------------------------------------------
/// ContentGenerator - Generates static pages from markdown files
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var path = require('path');
var walk = require('walk');
var Promise = require('bluebird');
var nunjucks = require('nunjucks');
var fastmatter = require('fastmatter');

// Internal Modules
var paths = require('./paths');

// Managers
var configMan = require('./config');
var renderMan = require('./renderers/manager');

// Promisifications
var readFile = Promise.promisify(require('fs').readFile);
var writeFile = Promise.promisify(require('fs').writeFile);
var mkdirp = Promise.promisify(require('mkdirp'));
var rimraf = Promise.promisify(require('rimraf'));
var marked = Promise.promisify(require('marked'));
var ncp = Promise.promisify(require('ncp'));

//----------------------------------------------------------------------------------------------------------------------

class ContentGenerator {
    //------------------------------------------------------------------------------------------------------------------
    // Setup
    //------------------------------------------------------------------------------------------------------------------

    _setupMarked()
    {
        // We force sanitize to true, otherwise pages are too limited
        var config = _.merge({}, configMan.config.marked, { sanitize: false });
        marked.setOptions(config);
    } // end _setupMarked

    //------------------------------------------------------------------------------------------------------------------
    // Helpers
    //------------------------------------------------------------------------------------------------------------------

    _discoverFiles(directory, extension)
    {
        var files = [];

        return new Promise((resolve, reject) =>
        {
            // Walk the directory
            var walker = walk.walk(directory);
            walker.on('file', (root, stats, next) =>
            {
                // If no extension was passed in, we find all files, otherwise only ones that match `extension`.
                if(!extension || path.extname(stats.name) == extension)
                {
                    files.push({ root, stats });
                } // end if

                next();
            });

            walker.on('error', (error) => { reject(error); });
            walker.on('end', () => { resolve(files); });
        });
    } // end _discoverFiles

    _parseFrontmatter(sourceDir, fileObj, pageContents)
    {
        // Parse the YAML frontmatter
        var page = fastmatter(pageContents);

        // Add additional properties
        page.attributes.created = new Date(page.attributes.created || fileObj.stats.birthtime);
        page.attributes.modified = new Date(page.attributes.modified || fileObj.stats.mtime);

        // The base url is either whatever the user set, or it's the page inside the pages directory.
        page.baseURL = page.attributes.baseURL || '/' + path.relative(path.join(sourceDir, configMan.config.directories.pages), fileObj.root);
        page.filename = page.attributes.filename || fileObj.stats.name.replace('.md', '.html');

        // We handle the slug property specially
        if(page.attributes.slug)
        {
            page.baseURL += '/' + page.attributes.slug;
            page.filename = 'index.html';
        } // end if

        return page;
    } // end _parseFrontmatter

    //------------------------------------------------------------------------------------------------------------------
    // Internal Generators
    //------------------------------------------------------------------------------------------------------------------

    _copyStaticFiles(sourceDir, outputDir)
    {
        var from = path.join(sourceDir, configMan.config.directories.static);
        var to = path.join(outputDir, configMan.config.directories.static);
        return ncp(from, to);
    } // end _copyStaticFiles

    _generateFromMarkdown(sourceDir, outputDir)
    {
        return this._discoverFiles(path.join(sourceDir, configMan.config.directories.pages), '.md')
            .map((fileObj) =>
            {
                return readFile(path.join(fileObj.root, fileObj.stats.name), 'utf8')
                    .then((data) =>
                    {
                        // Parse out our page object
                        return this._parseFrontmatter(sourceDir, fileObj, data);
                    })
                    .tap((page) =>
                    {
                        // Ensure the directory exists
                        return mkdirp(path.join(outputDir, page.baseURL));
                    })
                    .tap((page) =>
                    {
                        var renderer = 'default';
                        var options = {};

                        if(page.attributes.renderer)
                        {
                            if(_.isObject(page.attributes.renderer))
                            {
                                renderer = page.attributes.renderer.name;
                                options = _.omit(page.attributes.renderer, 'name');
                            }
                            else
                            {
                                renderer = page.attributes.renderer;
                            } // end if
                        } // end if

                        return renderMan.render(renderer, page, options)
                            .then((out) =>
                            {
                                // Write the file to disk
                                return writeFile(path.join(outputDir, page.baseURL, page.filename), out);
                            });
                    });
            })
            .then(() => { /* resolve with undefined */ });
    } // end _generateFromMarkdown

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------
    
    clean(sourceDir)
    {
        // Generate the site
        var outDir = path.join(sourceDir, configMan.config.directories.output);
        return rimraf(outDir);
    } // end clean

    generate(sourceDir, clean)
    {
        // Load config
        configMan.load(sourceDir);

        // Setup marked
        this._setupMarked();

        // Generate the site
        var outDir = path.join(sourceDir, configMan.config.directories.output);
        
        // Support cleaning before deletion
        var cleanPromise = Promise.resolve();
        if(clean)
        {
            cleanPromise = this.clean(sourceDir);
        } // end if
        
        return cleanPromise
            .then(() =>
            {
                return this._generateFromMarkdown(sourceDir, outDir);
            })
            .then(() =>
            {
                return this._copyStaticFiles(sourceDir, outDir);
            });
    } // end generate
} // end ContentGenerator

//----------------------------------------------------------------------------------------------------------------------

module.exports =  new ContentGenerator();

//----------------------------------------------------------------------------------------------------------------------
