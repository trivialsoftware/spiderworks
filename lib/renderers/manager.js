//----------------------------------------------------------------------------------------------------------------------
// RendererManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const json = require('./json');
const nunjucks = require('./nunjucks');

//----------------------------------------------------------------------------------------------------------------------

class RendererManager {
    constructor()
    {
        this.renderers = {};

        // Register the renderers
        this.register(json);
        this.register(nunjucks, true);
    } // end constructor

    register(renderer, isDefault)
    {
        if(isDefault)
        {
            this.renderers['default'] = renderer;
        } // end if

        this.renderers[renderer.name] = renderer;
    } // end register

    render(rendererName, page, options)
    {
        const renderer = this.renderers[rendererName];
        if(!renderer)
        {
            throw new Error(`Failed to find renderer '${ rendererName }'.`);
        } // end if

        return renderer.render(page, options);
    } // end render
} // end RendererManager

//----------------------------------------------------------------------------------------------------------------------

 module.exports = new RendererManager();

//----------------------------------------------------------------------------------------------------------------------
