//----------------------------------------------------------------------------------------------------------------------
// ContentGenerator - Generates static pages from markdown files
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const Promise = require('bluebird');
const nunjucks = require('nunjucks');
const fastmatter = require('fastmatter');

// Internal Modules
const paths = require('./paths');

// Managers
const configMan = require('./config');
const renderMan = require('./renderers/manager');

// Promisifications
const readFile = Promise.promisify(require('fs').readFile);
const writeFile = Promise.promisify(require('fs').writeFile);
const mkdirp = Promise.promisify(require('mkdirp'));
const rimraf = Promise.promisify(require('rimraf'));
const marked = Promise.promisify(require('marked'));
const ncp = Promise.promisify(require('ncp'));

//----------------------------------------------------------------------------------------------------------------------

class ContentGenerator {
    //------------------------------------------------------------------------------------------------------------------
    // Setup
    //------------------------------------------------------------------------------------------------------------------

    _setupMarked()
    {
        // We force sanitize to true, otherwise pages are too limited
        const config = _.merge({}, configMan.config.marked, { sanitize: false });
        marked.setOptions(config);
    } // end _setupMarked

    //------------------------------------------------------------------------------------------------------------------
    // Helpers
    //------------------------------------------------------------------------------------------------------------------

    _discoverFiles(directory, extension)
    {
        const files = [];

        return new Promise((resolve, reject) =>
        {
            // Walk the directory
            const walker = walk.walk(directory);
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
        const page = fastmatter(pageContents);

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
        const from = path.join(sourceDir, configMan.config.directories.static);
        const to = path.join(outputDir, configMan.config.directories.static);

        if(fs.existsSync(from))
        {
            return ncp(from, to);
        }
        else
        {
            return Promise.resolve();
        } // end if
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
                        let renderer = 'default';
                        let options = {};

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

    create(name)
    {
        const from = path.join(__dirname, '..', 'template');
        const to = path.join(process.cwd(), name);

        // Really, all we need to do is just copy the template directory to the right location.
        return ncp(from, to);
    } // end create

    clean(sourceDir)
    {
        // Generate the site
        const outDir = path.join(sourceDir, configMan.config.directories.output);
        return rimraf(outDir);
    } // end clean

    generate(sourceDir, clean)
    {
        // Load config
        configMan.load(sourceDir);

        // Setup marked
        this._setupMarked();

        // Generate the site
        const outDir = path.join(sourceDir, configMan.config.directories.output);

        // Support cleaning before deletion
        let cleanPromise = Promise.resolve();
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
