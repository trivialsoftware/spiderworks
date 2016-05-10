//----------------------------------------------------------------------------------------------------------------------
/// Main Deluge Script
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var walk = require('walk');
var YAML = require('yamljs');
var mkdirp = require('mkdirp');
var marked = require('marked');
var nunjucks = require('nunjucks');
var fastmatter = require('fastmatter');

//----------------------------------------------------------------------------------------------------------------------

var relPath = path.resolve('./');

var config = _.defaults({
        templates: 'templates',
        static: 'static',
        pages: 'pages',
        output: 'dist'
    },
    YAML.load(path.join(relPath, 'config.yml'))
);

//----------------------------------------------------------------------------------------------------------------------

function handleError(error, message)
{
    //TODO: Better error handling?
    console.error(`${ message }: \n ${ error.stack }`);
    process.exit(1);
} // end handleError

//----------------------------------------------------------------------------------------------------------------------

// Setup marked
marked.setOptions(config.marked || {});

// Setup nunjucks. Note: we /must/ set autoescape to false.
var nj = nunjucks.configure(config.templates, _.merge({ autoescape: false }, _.omit(config.nunjucks, ['autoescape'])));

// Walk the directory
var walker = walk.walk(path.join(relPath, config.pages));
walker.on('file', (root, stats, next) =>
{
    // We only care about markdown files
    if(path.extname(stats.name) == '.md')
    {
        // Read the file into a string
        fs.readFile(path.join(root, stats.name), 'utf8', (error, data) =>
        {
            if(error) { handleError(error, 'Failed to read file'); }

            // Parse the YAML frontmatter
            var page = fastmatter(data);

            // Add additional properties
            page.attributes.created = new Date(page.attributes.created || stats.birthtime);
            page.attributes.modified = new Date(page.attributes.modified || stats.mtime);

            // The base url is either whatever the user set, or it's the page inside the pages directory.
            var baseURL = page.attributes.baseURL || '/' + path.relative(path.join(relPath, config.pages), root);
            var pageFilename = page.attributes.filename || stats.name.replace('.md', '.html');

            if(page.attributes.slug)
            {
                baseURL += '/' + page.attributes.slug;
                pageFilename = 'index.html';
            } // end if

            var renderPath = path.join(relPath, config.output, baseURL);

            // Ensure all directories leading up to the output path exist
            mkdirp(renderPath, (error) =>
            {
                if(error) { handleError(error, 'Failed to create path'); }
                
                var context = _.cloneDeep(page.attributes);
                marked(page.body, (error, rendered) =>
                {
                    if(error) { handleError(error, 'Failed to render markdown'); }
                    
                    context.content = rendered;
                    var out = nj.render(page.attributes.template || 'default.html', context);
                    
                    fs.writeFile(path.join(renderPath, pageFilename), out, (error) =>
                    {
                        if(error) { handleError(error, 'Failed to write file'); }
                        next();
                    });
                });
            });
        });
    }
    else
    {
        next();
    } // end if
});

//----------------------------------------------------------------------------------------------------------------------
