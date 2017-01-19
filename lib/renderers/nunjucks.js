//----------------------------------------------------------------------------------------------------------------------
// NunjucksRenderer
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const Promise = require('bluebird');

// Internal Modules
const paths = require('../paths');

// Filters
const momentFilters = require('../filters/momentFilters');

// Managers
const configMan = require('../config');

// Promisifications
const marked = Promise.promisify(require('marked'));

//----------------------------------------------------------------------------------------------------------------------

class NunjucksRenderer {
    constructor()
    {
        this.name = 'html';
    } // end constructor

    render(page, options)
    {
        // We _must_ set autoescape to false, otherwise markdown breaks
        const config = _.merge({}, configMan.config.nunjucks, { autoescape: false });

        // Tell nunjucks about whatever templates directory the user setup, and our internal template directory
        const templates = [].concat(path.join(paths.sourceDir, configMan.config.directories.templates), path.join(paths.rootPath, 'templates'));

        // Store the configured nunjucks object
        this.nunjucks = nunjucks.configure(templates, config);

        // Install our custom filters
        _.forIn(momentFilters, (filter, name) =>
        {
            this.nunjucks.addFilter(name, filter);
        });

        // Allow user customization through `site.js`
        if(fs.existsSync(path.join(paths.sourceDir, 'site.js')))
        {
            const site = require(path.join(paths.sourceDir, 'site.js'));
            if(site && site.nunjucks)
            {
                site.nunjucks(nunjucks, this.nunjucks, require('marked'));
            } // end if
        } // end if

        // Render the markdown
        return marked(page.body)
            .then((rendered) =>
            {
                // Allow Nunjucks templating in the content
                rendered = this.nunjucks.renderString(rendered, page.attributes);

                // Now Render the markdown into the page
                const context = _.assign({}, page.attributes, { content: rendered });
                return this.nunjucks.render(page.attributes.template || 'default.html', context);
            });
    } // end render
} // end NunjucksRenderer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new NunjucksRenderer();

//----------------------------------------------------------------------------------------------------------------------
