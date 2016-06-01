//----------------------------------------------------------------------------------------------------------------------
/// Example of customizing nunjucks renderer
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

function customizeNunjucks(nunjucks, env, marked)
{
    // Configure the marked markdown parser
    var renderer = new marked.Renderer();

    renderer.table = function(header, body)
    {
        return `<div class="table-responsive"><table class="table table-striped table-hover table-bordered"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
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
} // end customizeNunjusts

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    nunjucks: customizeNunjucks
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
