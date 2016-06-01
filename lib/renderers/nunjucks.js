//----------------------------------------------------------------------------------------------------------------------
/// NunjucksRenderer
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');
var Promise = require('bluebird');

// Internal Modules
var paths = require('../paths');

// Filters
var momentFilters = require('../filters/momentFilters');

// Managers
var configMan = require('../config');

// Promisifications
var marked = Promise.promisify(require('marked'));

//----------------------------------------------------------------------------------------------------------------------

class NunjucksRenderer {
    constructor()
    {
        this.name = 'html';
    } // end constructor
    
    render(page, options)
    {
        // We _must_ set autoescape to false, otherwise markdown breaks
        var config = _.merge({}, configMan.config.nunjucks, { autoescape: false });

        // Tell nunjucks about whatever templates directory the user setup, and our internal template directory
        var templates = [].concat(path.join(paths.sourceDir, configMan.config.directories.templates), path.join(paths.rootPath, 'templates'));

        // Store the configured nunjucks object
        this.nunjucks = nunjucks.configure(templates, config);
        
        // Install our custom filters
        _.forIn(momentFilters, (filter, name) =>
        {
            this.nunjucks.addFilter(name, filter);
        });
        
        // Render the markdown
        return marked(page.body)
            .then((rendered) =>
            {
                // Allow Nunjucks templating in the content
                rendered = this.nunjucks.renderString(rendered, page.attributes);
                
                // Now Render the markdown into the page
                var context = _.assign({}, page.attributes, { content: rendered });
                return this.nunjucks.render(page.attributes.template || 'default.html', context);
            });
    } // end render
} // end NunjucksRenderer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new NunjucksRenderer();

//----------------------------------------------------------------------------------------------------------------------
