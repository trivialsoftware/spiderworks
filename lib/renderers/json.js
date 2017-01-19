//----------------------------------------------------------------------------------------------------------------------
// JSONRenderer
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

// Internal Modules
const paths = require('../paths');

// Promisifications
const marked = Promise.promisify(require('marked'));

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
            const site = require(path.join(paths.sourceDir, 'site.js'));
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
                const spaces = options.prettyPrint ? options.spaces || 4 : options.spaces || -1;

                // Now, return the rendered string
                return JSON.stringify(page, null, spaces);
            });
    } // end render
} // end JSONRenderer

//----------------------------------------------------------------------------------------------------------------------

module.exports = new JSONRenderer();

//----------------------------------------------------------------------------------------------------------------------
