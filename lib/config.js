//----------------------------------------------------------------------------------------------------------------------
// ConfigManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const path = require('path');
const YAML = require('yamljs');

//----------------------------------------------------------------------------------------------------------------------

class ConfigManager {
    constructor()
    {
        this._config = {};
        this._defaults = {
            directories: {
                templates: 'templates',
                static: 'static',
                pages: 'pages',
                output: 'dist'
            }
        };

        this._configCache = undefined;
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get config()
    {
        if(!this._configCache)
        {
            this._configCache = _.defaultsDeep(this._config, this._defaults);
        } // end if

        return this._configCache;
    } // end config

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    load(sourceDir)
    {
        // Clear the cached config value
        this._configCache = undefined;

        // Load the yaml config from the specified directory
        this._config = YAML.load(path.join(sourceDir, 'config.yml'))
    } // end load
} // end ConfigManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new ConfigManager();

//----------------------------------------------------------------------------------------------------------------------
