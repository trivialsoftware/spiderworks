//----------------------------------------------------------------------------------------------------------------------
// Renderer customization
//
// @module
//----------------------------------------------------------------------------------------------------------------------

function customizeNunjucks(nunjucks, env, marked)
{
    // Create a new markdown renderer
    const renderer = new marked.Renderer();

    // Wrap all generated tables in the bootstrap boilerplate to make them responsive
    renderer.table = function(header, body)
    {
        return `<table class="table table-responsive table-striped table-hover table-bordered"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    }; // end table parsing

    // Configure marked parser
    marked.setOptions({
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        renderer: renderer
    });
} // end customizeNunjucks

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    nunjucks: customizeNunjucks
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
