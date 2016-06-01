//----------------------------------------------------------------------------------------------------------------------
/// JSONRenderer
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

// Internal Modules
var paths = require('../paths');

// Promisifications
var marked = Promise.promisify(require('marked'));

//----------------------------------------------------------------------------------------------------------------------

class JSONRenderer {
    constructor()
    {
        this.name = 'json';
    } // end constructor

    render(page, options)
    {
        // Allow user customization through `site.js`
        if(fs.existsSync(path.join(paths.sourceDir, 'site.js')))
        {
            var site = require(path.join(paths.sourceDir, 'site.js'));
            if(site && site.json)
            {
                site.json(require('marked'));
            } // end if
        } // end if

        // First, render the contents to markdown
        return marked(page.body)
            .then((rendered) =>
            {
                // Save the rendered html, but ignore the
                page.rendered = rendered;

                // Change the extension on the filename
                page.filename = page.filename.substr(0, page.filename.lastIndexOf(".")) + (options.extension || ".json");

                // JSON indentation: support either the `prettyPrint` (which defaults to 4 spaces) or `spaces` option
                var spaces = options.prettyPrint ? options.spaces || 4 : options.spaces || -1;

                // Now, return the rendered string
                return JSON.stringify(page, null, spaces);
            });
    } // end render
} // end JSONRenderer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new JSONRenderer();

//----------------------------------------------------------------------------------------------------------------------
