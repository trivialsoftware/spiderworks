//----------------------------------------------------------------------------------------------------------------------
/// Brief description for momentFilters.js module.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var moment = require('moment');

var defaultFormat = "YYYY-MM-DD HH:mm Z";

//----------------------------------------------------------------------------------------------------------------------

function dateFilter(date, format)
{
    return moment(date).format(format || defaultFormat);
} // end dateFilter

function fromNowFilter(date)
{
    return moment(date).fromNow();
} // end fromNowFilter

function momentFilter(date, funcName)
{
    if(_.isString(date))
    {
        date = new Date(date);
    } // end if
    
    var args = Array.from(arguments).slice(2);
    var dateObj = moment(date);
    if(_.isFunction(dateObj[funcName]))
    {
        return dateObj[funcName].apply(dateObj, args);
    }
    else
    {
        return date;
    } // end if
} // end momentFilter

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    date: dateFilter,
    fromNow: fromNowFilter,
    moment: momentFilter
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
