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

// Managers
var configMan = require('../config');

// Promisifications
var marked = Promise.promisify(require('marked'));

//----------------------------------------------------------------------------------------------------------------------

class NunjucksRenderer {
    constructor()
    {
        this.name = 'html';
        
        // We _must_ set autoescape to false, otherwise markdown breaks
        var config = _.merge({}, configMan.config.nunjucks, { autoescape: false });

        // Tell nunjucks about whatever templates directory the user setup, and our internal template directory
        var templates = [].concat(configMan.config.directories.templates, path.join(paths.rootPath, 'templates'));

        // Store the configured nunjucks object
        this.nunjucks = nunjucks.configure(templates, config);
    } // end constructor
    
    render(page, options)
    {
        // Render the markdown
        return marked(page.body)
            .then((rendered) =>
            {
                var context = _.assign({}, page.attributes, { content: rendered });
                return this.nunjucks.render(page.attributes.template || 'default.html', context);
            });
    } // end render
} // end NunjucksRenderer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new NunjucksRenderer();

//----------------------------------------------------------------------------------------------------------------------
